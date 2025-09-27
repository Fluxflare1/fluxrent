# backend/disputes/views.py
import json
import time
import threading

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.http import StreamingHttpResponse, HttpResponseForbidden
from django.utils import timezone
from django.conf import settings

from .models import Dispute, DisputeAuditTrail
from .serializers import DisputeSerializer, DisputeCreateSerializer, DisputeAuditSerializer

# JWT decoding for SSE authorization
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.exceptions import TokenError, InvalidToken

# Use a simple in-memory queue to broadcast new disputes to SSE clients.
# Production: replace with Redis Pub/Sub (channel layer) for multi-worker support.
from collections import deque

_BROADCAST_QUEUE = deque(maxlen=1000)  # hold last N events


def _enqueue_event(event: dict):
    _BROADCAST_QUEUE.appendleft({"ts": timezone.now().isoformat(), "payload": event})


# Enqueue on create via post_save signal too — but ensure also enqueued on creation in view
def _dispute_to_event(dispute: Dispute):
    return {
        "uid": dispute.uid,
        "id": dispute.id,
        "user_email": dispute.user.email,
        "transaction_reference": dispute.transaction_reference,
        "amount": str(dispute.amount) if dispute.amount is not None else None,
        "reason": dispute.reason,
        "created_at": dispute.created_at.isoformat(),
    }


class IsAdminUserOrOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.user_id == request.user.id


class DisputeViewSet(viewsets.ModelViewSet):
    queryset = Dispute.objects.all().select_related("user", "assigned_to")
    serializer_class = DisputeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ("create",):
            return DisputeCreateSerializer
        return DisputeSerializer

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return self.queryset
        return self.queryset.filter(user=user)

    def perform_create(self, serializer):
        disp = serializer.save(user=self.request.user)
        # audit and broadcast
        DisputeAuditTrail.objects.create(dispute=disp, actor=self.request.user, action="created_via_api", data={})
        _enqueue_event(_dispute_to_event(disp))

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def resolve(self, request, pk=None):
        dispute = self.get_object()
        if not request.user.is_staff:
            return Response({"detail": "Only admins can resolve"}, status=status.HTTP_403_FORBIDDEN)
        dispute.status = "RESOLVED"
        dispute.resolved_at = timezone.now()
        dispute.save(update_fields=["status", "resolved_at"])
        DisputeAuditTrail.objects.create(dispute=dispute, actor=request.user, action="resolved", data={})
        return Response(DisputeSerializer(dispute).data)

    @action(detail=True, methods=["post"], permission_classes=[permissions.IsAuthenticated])
    def add_audit(self, request, pk=None):
        dispute = self.get_object()
        action = request.data.get("action", "")
        data = request.data.get("data", {})
        audit = DisputeAuditTrail.objects.create(dispute=dispute, actor=request.user, action=action, data=data)
        return Response(DisputeAuditSerializer(audit).data, status=status.HTTP_201_CREATED)


# SSE view
@api_view(["GET"])
@permission_classes([permissions.AllowAny])  # token checked inside for EventSource
def disputes_sse(request):
    """
    Server-Sent Events endpoint for admin clients.
    Event: 'new_dispute' with JSON payload.
    Protect via JWT in query param: ?token=<access_token>
    """
    token = request.query_params.get("token")
    if not token:
        return HttpResponseForbidden("token required")

    # Validate JWT
    try:
        token_backend = TokenBackend(algorithm=settings.SIMPLE_JWT["ALGORITHM"], signing_key=settings.SIMPLE_JWT["SIGNING_KEY"])
        data = token_backend.decode(token, verify=True)
    except Exception:
        return HttpResponseForbidden("invalid token")

    # Optional: require is_staff flag encoded in token or load user
    # If token lacks user info, you may decode and fetch user to check permissions.
    # We'll fetch user id from token if present
    user_id = data.get("user_id")
    from django.contrib.auth import get_user_model
    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
    except Exception:
        return HttpResponseForbidden("invalid token user")

    if not user.is_staff:
        return HttpResponseForbidden("only admins allowed")

    # SSE streaming generator
    def event_stream():
        # send initial heartbeat and optionally last N events
        yield "retry: 10000\n\n"
        # Send a small snapshot of last events
        for evt in list(_BROADCAST_QUEUE)[:20][::-1]:
            payload = json.dumps(evt["payload"])
            yield f"event: new_dispute\ndata: {payload}\n\n"

        # then keep checking the queue
        last_seen_ts = None
        while True:
            # iterate over queue to find any new events not yet sent
            if _BROADCAST_QUEUE:
                # peek newest events and send those newer than last_seen_ts
                for evt in list(_BROADCAST_QUEUE)[:50][::-1]:
                    if last_seen_ts is None or evt["ts"] > (last_seen_ts or ""):
                        payload = json.dumps(evt["payload"])
                        yield f"event: new_dispute\ndata: {payload}\n\n"
                        last_seen_ts = evt["ts"]
            time.sleep(1.0)

    response = StreamingHttpResponse(event_stream(), content_type="text/event-stream")
    response["Cache-Control"] = "no-cache"
    response["X-Accel-Buffering"] = "no"  # for nginx: disable buffering
    return response

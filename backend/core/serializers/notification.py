from rest_framework import viewsets
from core.models.notification import Notification
from core.serializers.notification import NotificationSerializer

class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer

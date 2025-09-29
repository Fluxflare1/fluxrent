from django.urls import re_path
from .consumers import DisputeConsumer

websocket_urlpatterns = [
    re_path(r"ws/disputes/$", DisputeConsumer.as_asgi()),
]

import json
from channels.generic.websocket import AsyncWebsocketConsumer

class DisputeConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("disputes", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("disputes", self.channel_name)

    async def dispute_created(self, event):
        # Push new dispute event to frontend
        await self.send(text_data=json.dumps(event))

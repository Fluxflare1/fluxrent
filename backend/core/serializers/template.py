from rest_framework import viewsets
from core.models.template import Template
from core.serializers.template import TemplateSerializer

class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer

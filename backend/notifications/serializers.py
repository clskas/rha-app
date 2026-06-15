from rest_framework import serializers
from .models import Notification

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'title', 'message', 'link', 'is_read', 'created_at']
        read_only_fields = ['id', 'recipient', 'created_at']

class NotificationCountSerializer(serializers.Serializer):
    count = serializers.IntegerField()
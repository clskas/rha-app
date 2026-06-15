from rest_framework import serializers
from .models import AuditLog

class AuditLogSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id', 'user', 'user_name', 'action', 'model_name', 'object_id', 'details', 'created_at']

    def get_user_name(self, obj):
        return str(obj.user) if obj.user else 'Système'
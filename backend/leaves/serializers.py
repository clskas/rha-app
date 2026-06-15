from rest_framework import serializers
from .models import LeaveType, Leave

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'

class LeaveSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    approved_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Leave
        fields = '__all__'
        read_only_fields = ['employee', 'status', 'approved_by']

    def get_employee_name(self, obj):
        return obj.employee.get_full_name()

    def get_approved_by_name(self, obj):
        return obj.approved_by.get_full_name() if obj.approved_by else None

from rest_framework import serializers
from .models import PaySlip, SalaryConfig

class PaySlipSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = PaySlip
        fields = '__all__'
        read_only_fields = ['cnss', 'cnss_employer']

    def get_employee_name(self, obj):
        return obj.employee.get_full_name()

class SalaryConfigSerializer(serializers.ModelSerializer):
    position_title = serializers.CharField(source='position.title', read_only=True)

    class Meta:
        model = SalaryConfig
        fields = '__all__'

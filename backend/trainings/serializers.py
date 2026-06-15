from rest_framework import serializers
from .models import Training, TrainingRegistration


class TrainingSerializer(serializers.ModelSerializer):
    registrations_count = serializers.SerializerMethodField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Training
        fields = '__all__'

    def get_registrations_count(self, obj):
        return obj.registrations.count()


class TrainingRegistrationSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    training_title = serializers.CharField(source='training.title', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = TrainingRegistration
        fields = '__all__'
        read_only_fields = ['employee']

    def get_employee_name(self, obj):
        return obj.employee.get_full_name()


class TrainingRegistrationCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingRegistration
        fields = ['training']

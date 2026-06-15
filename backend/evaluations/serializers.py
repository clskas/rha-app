from rest_framework import serializers
from .models import EvaluationCampaign, Evaluation

class EvaluationCampaignSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = EvaluationCampaign
        fields = '__all__'
        read_only_fields = ['created_by']

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name()

class EvaluationSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    evaluator_name = serializers.SerializerMethodField()
    campaign_title = serializers.CharField(source='campaign.title', read_only=True)

    class Meta:
        model = Evaluation
        fields = '__all__'

    def get_employee_name(self, obj):
        return obj.employee.get_full_name()

    def get_evaluator_name(self, obj):
        return obj.evaluator.get_full_name()

from rest_framework import serializers
from .models import JobOffer, Candidate

class JobOfferSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    candidate_count = serializers.SerializerMethodField()

    class Meta:
        model = JobOffer
        fields = '__all__'
        read_only_fields = ['created_by']

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name()

    def get_candidate_count(self, obj):
        return obj.candidates.count()

class CandidateSerializer(serializers.ModelSerializer):
    job_title = serializers.CharField(source='job_offer.title', read_only=True)

    class Meta:
        model = Candidate
        fields = '__all__'

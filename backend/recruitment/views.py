from rest_framework import viewsets, permissions
from .models import JobOffer, Candidate
from .serializers import JobOfferSerializer, CandidateSerializer
from permissions import IsAdminOrRH

class JobOfferViewSet(viewsets.ModelViewSet):
    queryset = JobOffer.objects.select_related('created_by').all()
    serializer_class = JobOfferSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrRH]
    search_fields = ['title', 'location']
    filterset_fields = ['status']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class CandidateViewSet(viewsets.ModelViewSet):
    queryset = Candidate.objects.select_related('job_offer').all()
    serializer_class = CandidateSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrRH]
    search_fields = ['first_name', 'last_name', 'email']
    filterset_fields = ['status', 'job_offer']

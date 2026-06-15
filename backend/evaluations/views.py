from rest_framework import viewsets, permissions
from .models import EvaluationCampaign, Evaluation
from .serializers import EvaluationCampaignSerializer, EvaluationSerializer
from permissions import IsAdminOrRHOrReadOnly

class EvaluationCampaignViewSet(viewsets.ModelViewSet):
    queryset = EvaluationCampaign.objects.select_related('created_by').all()
    serializer_class = EvaluationCampaignSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrRHOrReadOnly]
    search_fields = ['title']
    pagination_class = None

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.select_related('employee', 'evaluator', 'campaign').all()
    serializer_class = EvaluationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrRHOrReadOnly]
    filterset_fields = ['campaign', 'employee']

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'employee':
            return qs.filter(employee=user)
        return qs

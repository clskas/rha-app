from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Training, TrainingRegistration
from .serializers import TrainingSerializer, TrainingRegistrationSerializer, TrainingRegistrationCreateSerializer
from permissions import IsAdminOrRHOrReadOnly


class TrainingViewSet(viewsets.ModelViewSet):
    queryset = Training.objects.prefetch_related('registrations').all()
    serializer_class = TrainingSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrRHOrReadOnly]
    search_fields = ['title', 'trainer']
    filterset_fields = ['status']

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def register(self, request, pk=None):
        training = self.get_object()
        if training.status != 'planned':
            return Response({'detail': 'Cette formation n\'est pas ouverte aux inscriptions.'}, status=status.HTTP_400_BAD_REQUEST)
        if training.registrations.count() >= training.max_participants:
            return Response({'detail': 'Formation complète.'}, status=status.HTTP_400_BAD_REQUEST)
        if TrainingRegistration.objects.filter(training=training, employee=request.user).exists():
            return Response({'detail': 'Déjà inscrit.'}, status=status.HTTP_400_BAD_REQUEST)
        reg = TrainingRegistration.objects.create(training=training, employee=request.user)
        return Response(TrainingRegistrationSerializer(reg).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'])
    def my_registrations(self, request):
        regs = TrainingRegistration.objects.filter(employee=request.user).select_related('training')
        return Response(TrainingRegistrationSerializer(regs, many=True).data)


class TrainingRegistrationViewSet(viewsets.ModelViewSet):
    queryset = TrainingRegistration.objects.select_related('training', 'employee').all()
    serializer_class = TrainingRegistrationSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrRHOrReadOnly]
    filterset_fields = ['training', 'status']

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.user.role == 'employee':
            return qs.filter(employee=self.request.user)
        return qs

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user)

    @action(detail=True, methods=['patch'])
    def approve(self, request, pk=None):
        reg = self.get_object()
        reg.status = 'approved'
        reg.save()
        return Response(TrainingRegistrationSerializer(reg).data)

    @action(detail=True, methods=['patch'])
    def reject(self, request, pk=None):
        reg = self.get_object()
        reg.status = 'rejected'
        reg.save()
        return Response(TrainingRegistrationSerializer(reg).data)

    @action(detail=True, methods=['patch'])
    def complete(self, request, pk=None):
        reg = self.get_object()
        reg.status = 'completed'
        reg.completed_at = timezone.now().date()
        reg.save()
        return Response(TrainingRegistrationSerializer(reg).data)

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Poll, PollOption, PollVote
from .serializers import PollSerializer, PollCreateSerializer, VoteSerializer
from permissions import IsAdminOrRH


class PollViewSet(viewsets.ModelViewSet):
    queryset = Poll.objects.prefetch_related('options__votes', 'options')
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return PollCreateSerializer
        return PollSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated(), IsAdminOrRH()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post'], url_path='vote')
    def vote(self, request, pk=None):
        poll = self.get_object()
        if not poll.is_active:
            return Response({'detail': 'Ce sondage est fermé.'}, status=status.HTTP_400_BAD_REQUEST)
        serializer = VoteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        option_id = serializer.validated_data['option_id']
        try:
            option = PollOption.objects.get(id=option_id, poll=poll)
        except PollOption.DoesNotExist:
            return Response({'detail': 'Option invalide.'}, status=status.HTTP_400_BAD_REQUEST)
        if PollVote.objects.filter(option__poll=poll, voter=request.user).exists():
            return Response({'detail': 'Vous avez déjà voté.'}, status=status.HTTP_400_BAD_REQUEST)
        PollVote.objects.create(option=option, voter=request.user)
        return Response(PollSerializer(poll, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='my-votes')
    def my_votes(self, request):
        polls = Poll.objects.filter(options__votes__voter=request.user).prefetch_related('options__votes', 'options').distinct()
        return Response(PollSerializer(polls, many=True, context={'request': request}).data)

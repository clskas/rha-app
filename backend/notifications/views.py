from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer, NotificationCountSerializer
from .email_utils import send_notification_email

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)

    def perform_create(self, serializer):
        serializer.save(recipient=self.request.user)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = Notification.objects.filter(recipient=request.user, is_read=False).count()
        return Response({'count': count})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
        return Response({'status': 'ok'})

    @action(detail=False, methods=['post'], url_path='test-email')
    def test_email(self, request):
        if request.user.role not in ('admin', 'rh'):
            return Response({'error': 'Seuls les administrateurs et RH peuvent effectuer cette action.'}, status=status.HTTP_403_FORBIDDEN)
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Le champ email est requis.'}, status=status.HTTP_400_BAD_REQUEST)
        success = send_notification_email(
            recipient_email=email,
            subject='Test de notification RHA',
            message='Ceci est un email de test envoyé depuis l\'application Ressource Humaine. Si vous recevez ce message, la configuration email fonctionne correctement.',
            link=None,
        )
        if success:
            return Response({'status': 'ok', 'message': 'Email de test envoyé avec succès.'})
        return Response({'error': 'Échec de l\'envoi de l\'email de test.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
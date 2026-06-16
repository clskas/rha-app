from rest_framework import viewsets, permissions
from .models import Announcement
from .serializers import AnnouncementSerializer
from permissions import IsAdminOrRHOrReadOnly


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.select_related('author').all()
    serializer_class = AnnouncementSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrRHOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

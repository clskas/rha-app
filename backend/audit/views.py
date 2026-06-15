from rest_framework import generics, permissions
from rest_framework.pagination import PageNumberPagination
from .models import AuditLog
from .serializers import AuditLogSerializer
from permissions import IsAdminOrRH


class AuditLogPagination(PageNumberPagination):
    page_size = 50

class AuditLogList(generics.ListAPIView):
    queryset = AuditLog.objects.select_related('user').all()
    serializer_class = AuditLogSerializer
    pagination_class = AuditLogPagination
    permission_classes = [permissions.IsAuthenticated, IsAdminOrRH]

    def get_queryset(self):
        qs = super().get_queryset()
        action = self.request.query_params.get('action')
        if action:
            qs = qs.filter(action=action)
        return qs

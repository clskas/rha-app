from django.urls import path
from .views import AuditLogList

urlpatterns = [
    path('', AuditLogList.as_view(), name='audit-list'),
]

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DepartmentViewSet, PositionViewSet, EmployeeViewSet, EmployeeDocumentViewSet, ContractViewSet

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet)
router.register(r'positions', PositionViewSet)
router.register(r'documents', EmployeeDocumentViewSet)
router.register(r'contracts', ContractViewSet)
router.register(r'', EmployeeViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

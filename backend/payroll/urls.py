from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PaySlipViewSet, SalaryConfigViewSet

router = DefaultRouter()
router.register(r'payslips', PaySlipViewSet)
router.register(r'configs', SalaryConfigViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

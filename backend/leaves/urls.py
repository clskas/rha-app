from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LeaveTypeViewSet, LeaveViewSet

router = DefaultRouter()
router.register(r'types', LeaveTypeViewSet)
router.register(r'', LeaveViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

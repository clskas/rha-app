from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainingViewSet, TrainingRegistrationViewSet

router = DefaultRouter()
router.register(r'registrations', TrainingRegistrationViewSet)
router.register(r'', TrainingViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

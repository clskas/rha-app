from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EvaluationCampaignViewSet, EvaluationViewSet

router = DefaultRouter()
router.register(r'campaigns', EvaluationCampaignViewSet)
router.register(r'', EvaluationViewSet)

urlpatterns = [
    path('', include(router.urls)),
]

from django.contrib import admin
from .models import EvaluationCampaign, Evaluation

@admin.register(EvaluationCampaign)
class EvaluationCampaignAdmin(admin.ModelAdmin):
    list_display = ['title', 'start_date', 'end_date', 'is_active']

@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ['employee', 'evaluator', 'campaign', 'rating', 'is_submitted']
    list_filter = ['campaign', 'rating']

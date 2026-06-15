from django.contrib import admin
from .models import Training, TrainingRegistration


@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ['title', 'trainer', 'start_date', 'end_date', 'status', 'max_participants', 'cost']
    list_filter = ['status']
    search_fields = ['title', 'trainer']


@admin.register(TrainingRegistration)
class TrainingRegistrationAdmin(admin.ModelAdmin):
    list_display = ['training', 'employee', 'status', 'completed_at', 'created_at']
    list_filter = ['status']

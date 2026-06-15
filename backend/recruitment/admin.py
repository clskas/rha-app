from django.contrib import admin
from .models import JobOffer, Candidate

@admin.register(JobOffer)
class JobOfferAdmin(admin.ModelAdmin):
    list_display = ['title', 'location', 'status', 'created_at']
    list_filter = ['status']

@admin.register(Candidate)
class CandidateAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'job_offer', 'status']
    list_filter = ['status']

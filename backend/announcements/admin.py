from django.contrib import admin
from .models import Announcement


@admin.register(Announcement)
class AnnouncementAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'is_pinned', 'created_at']
    list_filter = ['is_pinned']
    search_fields = ['title', 'content']

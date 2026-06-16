from django.contrib import admin
from .models import Poll, PollOption, PollVote


class PollOptionInline(admin.TabularInline):
    model = PollOption
    extra = 1


@admin.register(Poll)
class PollAdmin(admin.ModelAdmin):
    list_display = ['question', 'created_by', 'is_active', 'created_at', 'expires_at']
    list_filter = ['is_active']
    search_fields = ['question']
    inlines = [PollOptionInline]


@admin.register(PollVote)
class PollVoteAdmin(admin.ModelAdmin):
    list_display = ['option', 'voter', 'voted_at']
    list_filter = ['option__poll']

from rest_framework import serializers
from .models import Announcement


class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = '__all__'
        read_only_fields = ['author', 'created_at', 'updated_at']

    def get_author_name(self, obj):
        return obj.author.get_full_name()

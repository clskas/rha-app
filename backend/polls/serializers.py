from rest_framework import serializers
from .models import Poll, PollOption, PollVote


class PollOptionSerializer(serializers.ModelSerializer):
    vote_count = serializers.SerializerMethodField()
    percentage = serializers.SerializerMethodField()

    class Meta:
        model = PollOption
        fields = ['id', 'text', 'vote_count', 'percentage']

    def get_vote_count(self, obj):
        return obj.votes.count()

    def get_percentage(self, obj):
        total = PollVote.objects.filter(option__poll=obj.poll).count()
        count = obj.votes.count()
        return round(count / total * 100, 1) if total else 0


class PollSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    options = PollOptionSerializer(many=True, read_only=True)
    total_votes = serializers.SerializerMethodField()
    has_voted = serializers.SerializerMethodField()
    user_vote_option_id = serializers.SerializerMethodField()

    class Meta:
        model = Poll
        fields = ['id', 'question', 'created_by', 'created_by_name', 'is_active', 'created_at', 'expires_at', 'options', 'total_votes', 'has_voted', 'user_vote_option_id']
        read_only_fields = ['created_by', 'created_at']

    def get_created_by_name(self, obj):
        return obj.created_by.get_full_name() or obj.created_by.username

    def get_total_votes(self, obj):
        return PollVote.objects.filter(option__poll=obj).count()

    def get_has_voted(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return PollVote.objects.filter(option__poll=obj, voter=request.user).exists()
        return False

    def get_user_vote_option_id(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            vote = PollVote.objects.filter(option__poll=obj, voter=request.user).first()
            return vote.option_id if vote else None
        return None


class PollCreateSerializer(serializers.ModelSerializer):
    options_text = serializers.ListField(child=serializers.CharField(max_length=200), write_only=True)

    class Meta:
        model = Poll
        fields = ['question', 'is_active', 'expires_at', 'options_text']

    def create(self, validated_data):
        options_text = validated_data.pop('options_text')
        poll = Poll.objects.create(**validated_data)
        for text in options_text:
            PollOption.objects.create(poll=poll, text=text)
        return poll


class VoteSerializer(serializers.Serializer):
    option_id = serializers.IntegerField()

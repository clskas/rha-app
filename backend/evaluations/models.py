from django.db import models
from accounts.models import User
from employees.models import Employee

class EvaluationCampaign(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='campaigns')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Campagne d\'évaluation'
        verbose_name_plural = 'Campagnes d\'évaluation'

    def __str__(self):
        return self.title

class Evaluation(models.Model):
    RATING_CHOICES = [(i, str(i)) for i in range(1, 6)]
    campaign = models.ForeignKey(EvaluationCampaign, on_delete=models.CASCADE, related_name='evaluations')
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='evaluations')
    evaluator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_evaluations')
    rating = models.IntegerField(choices=RATING_CHOICES)
    comments = models.TextField()
    achievements = models.TextField(blank=True)
    areas_for_improvement = models.TextField(blank=True)
    objectives = models.TextField(blank=True)
    is_submitted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Évaluation'
        verbose_name_plural = 'Évaluations'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee} évalué par {self.evaluator} - {self.campaign}"

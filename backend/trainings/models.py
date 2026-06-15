from django.db import models
from accounts.models import User


class Training(models.Model):
    STATUS_CHOICES = [
        ('planned', 'Planifiée'),
        ('in_progress', 'En cours'),
        ('completed', 'Terminée'),
        ('cancelled', 'Annulée'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField()
    trainer = models.CharField(max_length=200)
    start_date = models.DateField()
    end_date = models.DateField()
    max_participants = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    cost = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Formation'
        verbose_name_plural = 'Formations'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class TrainingRegistration(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('rejected', 'Refusé'),
        ('completed', 'Terminé'),
    ]
    training = models.ForeignKey(Training, on_delete=models.CASCADE, related_name='registrations')
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='training_registrations')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    completed_at = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Inscription formation'
        verbose_name_plural = 'Inscriptions formations'
        unique_together = ['training', 'employee']
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee} -> {self.training}"

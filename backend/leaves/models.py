from django.db import models
from accounts.models import User

class LeaveType(models.Model):
    name = models.CharField(max_length=100)
    default_days = models.IntegerField()
    requires_document = models.BooleanField(default=False)
    is_paid = models.BooleanField(default=True)
    color = models.CharField(max_length=7, default='#3B82F6')

    class Meta:
        verbose_name = 'Type de congé'
        verbose_name_plural = 'Types de congés'
        ordering = ['name']

    def __str__(self):
        return self.name

class Leave(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('rejected', 'Refusé'),
    ]
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='leaves')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    start_date = models.DateField()
    end_date = models.DateField()
    reason = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    approved_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_leaves')
    comment = models.TextField(blank=True)
    document = models.FileField(upload_to='leaves/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Congé'
        verbose_name_plural = 'Congés'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee} - {self.leave_type} ({self.start_date} -> {self.end_date})"

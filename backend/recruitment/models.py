from django.db import models
from accounts.models import User
from employees.models import Position

class JobOffer(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Brouillon'),
        ('published', 'Publiée'),
        ('closed', 'Fermée'),
    ]
    title = models.CharField(max_length=200)
    position = models.ForeignKey(Position, on_delete=models.CASCADE, null=True, blank=True)
    description = models.TextField()
    requirements = models.TextField()
    location = models.CharField(max_length=100)
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='job_offers')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Offre d\'emploi'
        verbose_name_plural = 'Offres d\'emploi'
        ordering = ['-created_at']

    def __str__(self):
        return self.title

class Candidate(models.Model):
    STATUS_CHOICES = [
        ('received', 'Reçu'),
        ('reviewed', 'Examiné'),
        ('interviewed', 'Entretien'),
        ('accepted', 'Accepté'),
        ('rejected', 'Refusé'),
    ]
    job_offer = models.ForeignKey(JobOffer, on_delete=models.CASCADE, related_name='candidates')
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    cv_file = models.FileField(upload_to='cvs/', blank=True, null=True)
    cover_letter = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='received')
    notes = models.TextField(blank=True)
    interview_date = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Candidat'
        verbose_name_plural = 'Candidats'

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.job_offer.title}"

from django.db import models
from accounts.models import User

class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Département'
        verbose_name_plural = 'Départements'
        ordering = ['name']

    def __str__(self):
        return self.name

class Position(models.Model):
    title = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='positions')
    description = models.TextField(blank=True)

    class Meta:
        verbose_name = 'Poste'
        verbose_name_plural = 'Postes'

    def __str__(self):
        return f"{self.title} - {self.department.name}"

class Employee(models.Model):
    CONTRACT_CHOICES = [
        ('cdi', 'CDI'),
        ('cdd', 'CDD'),
        ('stage', 'Stage'),
        ('freelance', 'Freelance'),
        ('prestation', 'Prestation de services'),
    ]
    CURRENCY_CHOICES = [
        ('CDF', 'CDF (Franc Congolais)'),
        ('XOF', 'XOF (Franc CFA)'),
        ('USD', 'USD (Dollar Américain)'),
    ]
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='employee_profile')
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, related_name='employees')
    position = models.ForeignKey(Position, on_delete=models.SET_NULL, null=True, related_name='employees')
    manager = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='subordinates')
    contract_type = models.CharField(max_length=20, choices=CONTRACT_CHOICES, default='cdi')
    hire_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    salary = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='CDF')
    cnss_number = models.CharField(max_length=50, blank=True, verbose_name='Numéro CNSS')
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=200, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Employé'
        verbose_name_plural = 'Employés'
        ordering = ['user__first_name', 'user__last_name']

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.department}"

class Contract(models.Model):
    STATUS_CHOICES = [
        ('active', 'Actif'),
        ('expired', 'Expiré'),
        ('terminated', 'Résilié'),
    ]
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='contracts')
    contract_type = models.CharField(max_length=20, choices=Employee.CONTRACT_CHOICES)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    salary = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, choices=Employee.CURRENCY_CHOICES, default='CDF')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    signed_copy = models.FileField(upload_to='contracts/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Contrat'
        verbose_name_plural = 'Contrats'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.employee} - {self.get_contract_type_display()} ({self.get_status_display()})"

class EmployeeDocument(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='documents')
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='documents/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Document'
        verbose_name_plural = 'Documents'

    def __str__(self):
        return self.title

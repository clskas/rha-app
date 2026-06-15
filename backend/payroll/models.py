from django.db import models
from accounts.models import User
from employees.models import Employee

class PaySlip(models.Model):
    CURRENCY_CHOICES = [
        ('CDF', 'CDF (Franc Congolais)'),
        ('XOF', 'XOF (Franc CFA)'),
        ('USD', 'USD (Dollar Américain)'),
    ]
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='payslips')
    month = models.IntegerField()
    year = models.IntegerField()
    gross_salary = models.DecimalField(max_digits=12, decimal_places=2)
    net_salary = models.DecimalField(max_digits=12, decimal_places=2)
    taxes = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cnss = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cnss_employer = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    bonuses = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deductions = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    currency = models.CharField(max_length=3, choices=CURRENCY_CHOICES, default='CDF')
    pdf_file = models.FileField(upload_to='payslips/', blank=True, null=True)
    is_paid = models.BooleanField(default=False)
    paid_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Bulletin de paie'
        verbose_name_plural = 'Bulletins de paie'
        unique_together = ['employee', 'month', 'year']
        ordering = ['-year', '-month']

    def __str__(self):
        return f"{self.employee} - {self.month}/{self.year}"

class SalaryConfig(models.Model):
    position = models.OneToOneField('employees.Position', on_delete=models.CASCADE, related_name='salary_config')
    base_salary = models.DecimalField(max_digits=12, decimal_places=2)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    bonus_eligibility = models.BooleanField(default=False)

    class Meta:
        verbose_name = 'Configuration salariale'
        verbose_name_plural = 'Configurations salariales'

    def __str__(self):
        return f"{self.position.title} - {self.base_salary}"

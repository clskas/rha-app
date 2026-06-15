from django.contrib import admin
from .models import PaySlip, SalaryConfig

@admin.register(PaySlip)
class PaySlipAdmin(admin.ModelAdmin):
    list_display = ['employee', 'month', 'year', 'net_salary', 'is_paid']
    list_filter = ['month', 'year', 'is_paid']

@admin.register(SalaryConfig)
class SalaryConfigAdmin(admin.ModelAdmin):
    list_display = ['position', 'base_salary', 'tax_rate']

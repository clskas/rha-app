from django.contrib import admin
from .models import Department, Position, Employee

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']

@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ['title', 'department']
    list_filter = ['department']

@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['user', 'department', 'position', 'contract_type', 'hire_date']
    list_filter = ['department', 'contract_type']
    search_fields = ['user__first_name', 'user__last_name']

from rest_framework import serializers
from .models import Department, Position, Employee, EmployeeDocument, Contract
from accounts.serializers import UserSerializer

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'

class PositionSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Position
        fields = '__all__'

class EmployeeDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeeDocument
        fields = '__all__'
        read_only_fields = ['employee']

class ContractSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()
    contract_type_display = serializers.CharField(source='get_contract_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    currency_display = serializers.CharField(source='get_currency_display', read_only=True)

    class Meta:
        model = Contract
        fields = '__all__'

    def get_employee_name(self, obj):
        return obj.employee.user.get_full_name()

class EmployeeSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    position_title = serializers.CharField(source='position.title', read_only=True)
    manager_name = serializers.SerializerMethodField()
    currency_display = serializers.CharField(source='get_currency_display', read_only=True)
    documents = EmployeeDocumentSerializer(many=True, read_only=True)
    contract_history = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = '__all__'

    def get_manager_name(self, obj):
        if obj.manager:
            return obj.manager.user.get_full_name()
        return None

    def get_contract_history(self, obj):
        contracts = obj.contracts.all()
        return ContractSerializer(contracts, many=True).data

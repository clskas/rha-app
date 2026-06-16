import csv, secrets
from django.http import HttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from datetime import date, timedelta
from django.db.models import Prefetch
from .models import Department, Position, Employee, EmployeeDocument, Contract
from .serializers import DepartmentSerializer, PositionSerializer, EmployeeSerializer, EmployeeDocumentSerializer, ContractSerializer
from permissions import IsAdminOrRH, IsAdminOrRHOrReadOnly, IsAdminOrRHOrManagerOrReadOnly

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrRHOrManagerOrReadOnly]
    search_fields = ['name']
    pagination_class = None

class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrRHOrManagerOrReadOnly]
    search_fields = ['title']
    filterset_fields = ['department']
    pagination_class = None

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.select_related('user', 'department', 'position', 'manager__user').all()
    serializer_class = EmployeeSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrRHOrManagerOrReadOnly]
    search_fields = ['user__first_name', 'user__last_name', 'user__email']
    filterset_fields = ['department', 'position', 'contract_type']

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'manager':
            return qs.filter(manager__user=user)
        if user.role == 'employee':
            return qs.filter(user=user)
        return qs

    @action(detail=False, methods=['get'], url_path='export-csv')
    def export_csv(self, request):
        qs = self.get_queryset().select_related('user', 'department', 'position', 'manager__user')
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = 'attachment; filename="employes.csv"'
        writer = csv.writer(response)
        writer.writerow(['Prénom', 'Nom', 'Email', 'Téléphone', 'Département', 'Poste', 'Type contrat', 'Date embauche', 'Salaire', 'Devise', 'CNSS'])
        for e in qs:
            writer.writerow([
                e.user.first_name, e.user.last_name, e.user.email, e.user.phone,
                e.department.name if e.department else '',
                e.position.title if e.position else '',
                e.get_contract_type_display(), e.hire_date, e.salary, e.currency,
                e.cnss_number,
            ])
        return response

    @action(detail=False, methods=['post'], url_path='import-excel', permission_classes=[IsAdminOrRH])
    def import_excel(self, request):
        import openpyxl
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Aucun fichier fourni.'}, status=status.HTTP_400_BAD_REQUEST)

        wb = openpyxl.load_workbook(file, read_only=True)
        ws = wb.active
        rows = list(ws.iter_rows(min_row=2, values_only=True))
        headers = ['first_name', 'last_name', 'email', 'phone', 'department_name',
                   'position_title', 'contract_type', 'hire_date', 'salary', 'currency',
                   'cnss_number', 'address', 'emergency_contact']

        success_count = 0
        errors = []

        for idx, row in enumerate(rows):
            row_data = dict(zip(headers, row))
            row_num = idx + 2
            try:
                email = (row_data.get('email') or '').strip().lower()
                if not email:
                    errors.append(f"Ligne {row_num} : email manquant")
                    continue

                first_name = (row_data.get('first_name') or '').strip()
                last_name = (row_data.get('last_name') or '').strip()

                dept_name = (row_data.get('department_name') or '').strip()
                department = None
                if dept_name:
                    department, _ = Department.objects.get_or_create(name=dept_name)

                pos_title = (row_data.get('position_title') or '').strip()
                position = None
                if pos_title and department:
                    position, _ = Position.objects.get_or_create(title=pos_title, department=department)

                username = email.split('@')[0]
                base_username = username
                suffix = 1
                from accounts.models import User
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{suffix}"
                    suffix += 1

                password = secrets.token_urlsafe(12)
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    password=password,
                    first_name=first_name,
                    last_name=last_name,
                    phone=(row_data.get('phone') or '').strip(),
                    role='employee',
                )

                hire_date = row_data.get('hire_date')
                if isinstance(hire_date, str):
                    from datetime import datetime
                    hire_date = datetime.strptime(hire_date, '%Y-%m-%d').date()
                elif hasattr(hire_date, 'date'):
                    hire_date = hire_date.date() if hasattr(hire_date, 'date') else hire_date

                salary_val = row_data.get('salary') or 0
                try:
                    salary_val = float(salary_val)
                except (ValueError, TypeError):
                    salary_val = 0

                Employee.objects.create(
                    user=user,
                    department=department,
                    position=position,
                    contract_type=(row_data.get('contract_type') or 'cdi').strip(),
                    hire_date=hire_date,
                    salary=salary_val,
                    currency=(row_data.get('currency') or 'CDF').strip().upper(),
                    cnss_number=(row_data.get('cnss_number') or '').strip(),
                    address=(row_data.get('address') or '').strip(),
                    emergency_contact=(row_data.get('emergency_contact') or '').strip(),
                )
                success_count += 1
            except Exception as e:
                errors.append(f"Ligne {row_num} : {str(e)}")

        return Response({'success_count': success_count, 'errors': errors})

    @action(detail=False, methods=['get'], url_path='org-chart')
    def org_chart(self, request):
        employees = Employee.objects.select_related('user', 'department', 'position', 'manager__user').all()
        emp_map = {}
        for e in employees:
            emp_map[e.id] = {
                'id': e.id,
                'name': e.user.get_full_name(),
                'position_title': e.position.title if e.position else '',
                'department_id': e.department_id,
                'department_name': e.department.name if e.department else None,
                'manager_id': e.manager_id,
                'manager_name': e.manager.user.get_full_name() if e.manager else None,
                'photo': None,
                'subordinates': [],
            }
        for e_data in emp_map.values():
            mgr_id = e_data['manager_id']
            if mgr_id and mgr_id in emp_map:
                emp_map[mgr_id]['subordinates'].append(e_data['id'])

        dept_emp_map = {}
        unassigned = []
        for e_data in emp_map.values():
            dept_name = e_data['department_name']
            if dept_name:
                dept_emp_map.setdefault(dept_name, []).append(e_data)
            else:
                unassigned.append(e_data)

        departments = []
        for dept in Department.objects.all().order_by('name'):
            emps = dept_emp_map.pop(dept.name, [])
            departments.append({'id': dept.id, 'name': dept.name, 'employees': emps})
        for name, emps in dept_emp_map.items():
            departments.append({'id': None, 'name': name, 'employees': emps})

        return Response({'departments': departments, 'unassigned': unassigned})

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_document(self, request, pk=None):
        employee = self.get_object()
        serializer = EmployeeDocumentSerializer(data={'employee': employee.id, 'title': request.data.get('title', ''), 'file': request.data.get('file')})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ContractViewSet(viewsets.ModelViewSet):
    queryset = Contract.objects.select_related('employee__user').all()
    serializer_class = ContractSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrRHOrReadOnly]
    filterset_fields = ['status', 'contract_type', 'employee']

    @action(detail=False, methods=['get'], url_path='renewal-alerts')
    def renewal_alerts(self, request):
        today = date.today()
        thirty_days = today + timedelta(days=30)
        contracts = self.get_queryset().filter(
            status='active', end_date__isnull=False,
            end_date__gte=today, end_date__lte=thirty_days
        )
        serializer = self.get_serializer(contracts, many=True)
        return Response(serializer.data)

class EmployeeDocumentViewSet(viewsets.ModelViewSet):
    queryset = EmployeeDocument.objects.all()
    serializer_class = EmployeeDocumentSerializer

    def get_queryset(self):
        employee_id = self.request.query_params.get('employee')
        if employee_id:
            return self.queryset.filter(employee_id=employee_id)
        return self.queryset

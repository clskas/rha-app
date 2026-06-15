from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User
from .models import Department, Position, Employee, Contract

class EmployeeTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('admin', 'admin@t.com', 'admin123', role='admin')
        self.emp_user = User.objects.create_user('emp', 'emp@t.com', 'emp123', first_name='Jean', last_name='Koffi', role='employee')
        self.dept = Department.objects.create(name='IT', description='Tech')
        self.pos = Position.objects.create(title='Dev', department=self.dept)
        self.emp = Employee.objects.create(user=self.emp_user, department=self.dept, position=self.pos, hire_date='2024-01-01')
        self.client.force_authenticate(user=self.admin)

    def test_list_departments(self):
        res = self.client.get('/api/employees/departments/')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data), 1)

    def test_create_department(self):
        res = self.client.post('/api/employees/departments/', {'name': 'RH', 'description': 'RH Dept'})
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data['name'], 'RH')

    def test_list_employees(self):
        res = self.client.get('/api/employees/')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(res.data['count'], 1)

    def test_create_employee(self):
        new_user = User.objects.create_user('newemp', 'new@t.com', 'new123', first_name='New', last_name='Emp', role='employee')
        res = self.client.post('/api/employees/', {
            'user_id': new_user.id, 'department': self.dept.id,
            'position': self.pos.id, 'contract_type': 'cdi', 'hire_date': '2024-06-01'
        })
        self.assertEqual(res.status_code, 201)

    def test_employee_search(self):
        res = self.client.get('/api/employees/?search=Koffi')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(res.data['count'], 1)

    def test_employee_filter_department(self):
        res = self.client.get(f'/api/employees/?department={self.dept.id}')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(res.data['count'], 1)

    def test_import_excel(self):
        import openpyxl
        from io import BytesIO
        wb = openpyxl.Workbook()
        ws = wb.active
        ws.append(['Prénom', 'Nom', 'Email', 'Téléphone', 'Département',
                    'Poste', 'Type contrat', 'Date embauche', 'Salaire', 'Devise'])
        ws.append(['Alice', 'Konan', 'alice@test.com', '+225010203', 'IT',
                    'Dev', 'cdi', '2026-01-15', 500000, 'CDF'])
        ws.append(['Bob', 'Zadi', 'bob@test.com', '+225040506', 'IT',
                    'Dev', 'cdd', '2026-02-01', 400000, 'CDF'])
        f = BytesIO()
        wb.save(f)
        f.seek(0)
        res = self.client.post('/api/employees/import-excel/', {'file': f}, format='multipart')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['success_count'], 2)

    def test_list_contracts(self):
        Contract.objects.create(employee=self.emp, contract_type='cdi', start_date='2026-01-01', end_date='2026-12-31', salary=500000)
        res = self.client.get('/api/employees/contracts/')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(res.data['count'], 1)

    def test_create_contract(self):
        res = self.client.post('/api/employees/contracts/', {
            'employee': self.emp.id, 'contract_type': 'cdi',
            'start_date': '2026-01-01', 'end_date': '2026-12-31', 'salary': 500000
        })
        self.assertEqual(res.status_code, 201)

    def test_renewal_alerts(self):
        from datetime import date, timedelta
        future = date.today() + timedelta(days=15)
        Contract.objects.create(employee=self.emp, contract_type='cdd', start_date='2025-01-01', end_date=future, salary=500000, status='active')
        res = self.client.get('/api/employees/contracts/renewal-alerts/')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data), 1)

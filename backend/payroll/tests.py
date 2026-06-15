from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User
from employees.models import Department, Position
from .models import PaySlip, SalaryConfig

class PayrollTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('admin', 'a@t.com', 'admin123', role='admin')
        self.emp = User.objects.create_user('emp', 'e@t.com', 'emp123', role='employee')
        self.dept = Department.objects.create(name='IT')
        self.pos = Position.objects.create(title='Dev', department=self.dept)
        self.client.force_authenticate(user=self.admin)

    def test_create_payslip(self):
        res = self.client.post('/api/payroll/payslips/', {
            'employee': self.emp.id, 'month': 6, 'year': 2025,
            'gross_salary': 500000, 'net_salary': 450000
        })
        self.assertEqual(res.status_code, 201)

    def test_list_payslips(self):
        PaySlip.objects.create(employee=self.emp, month=6, year=2025, gross_salary=500000, net_salary=450000)
        res = self.client.get('/api/payroll/payslips/')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(res.data['count'], 1)

    def test_create_salary_config(self):
        res = self.client.post('/api/payroll/configs/', {
            'position': self.pos.id, 'base_salary': 500000, 'tax_rate': 5
        })
        self.assertEqual(res.status_code, 201)

    def test_employee_sees_own_payslips(self):
        PaySlip.objects.create(employee=self.emp, month=6, year=2025, gross_salary=500000, net_salary=450000)
        self.client.force_authenticate(user=self.emp)
        res = self.client.get('/api/payroll/payslips/')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(res.data['count'], 1)

    def test_calculate_cnss(self):
        from .utils import calculate_cnss
        emp_cnss, emp_cnss_empl = calculate_cnss(100000)
        self.assertEqual(emp_cnss, 5000)
        self.assertEqual(emp_cnss_empl, 5000)

    def test_calculate_ipr(self):
        from .utils import calculate_ipr
        self.assertEqual(calculate_ipr(50000), 0)
        self.assertEqual(calculate_ipr(300000), 30000)
        self.assertEqual(calculate_ipr(750000), 112500)
        self.assertEqual(calculate_ipr(1500000), 300000)
        self.assertEqual(calculate_ipr(3000000), 750000)

    def test_calculate_endpoint(self):
        res = self.client.post('/api/payroll/payslips/calculate/', {
            'gross_salary': 500000, 'bonuses': 50000, 'deductions': 10000
        })
        self.assertEqual(res.status_code, 200)
        self.assertIn('net_salary', res.data)
        self.assertIn('cnss_employee', res.data)
        self.assertIn('taxes', res.data)

    def test_generate_pdf(self):
        payslip = PaySlip.objects.create(employee=self.emp, month=1, year=2026, gross_salary=500000, net_salary=450000)
        res = self.client.post(f'/api/payroll/payslips/{payslip.id}/generate-pdf/')
        self.assertEqual(res.status_code, 200)
        self.assertIn('pdf_url', res.data)

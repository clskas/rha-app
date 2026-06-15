from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User
from employees.models import Employee, Department, Position
from leaves.models import LeaveType, Leave
from recruitment.models import JobOffer, Candidate
from payroll.models import PaySlip
from datetime import date, datetime


class DashboardStatsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('admin', 'a@t.com', 'admin123', role='admin')
        self.dept = Department.objects.create(name='IT')
        self.pos = Position.objects.create(title='Dev', department=self.dept)
        self.emp_user = User.objects.create_user('emp', 'e@t.com', 'emp123', role='employee')
        self.emp = Employee.objects.create(
            user=self.emp_user, department=self.dept, position=self.pos,
            contract_type='cdi', hire_date='2025-01-01', salary=500000
        )
        self.lt = LeaveType.objects.create(name='Annuel', default_days=30)

    def test_stats_authenticated(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/dashboard/stats/')
        self.assertEqual(res.status_code, 200)
        self.assertIn('employees_count', res.data)
        self.assertIn('pending_leaves', res.data)
        self.assertIn('active_offers', res.data)
        self.assertIn('monthly_payroll', res.data)

    def test_stats_unauthenticated(self):
        res = self.client.get('/api/dashboard/stats/')
        self.assertEqual(res.status_code, 401)

    def test_stats_counts(self):
        Leave.objects.create(
            employee=self.emp_user, leave_type=self.lt,
            start_date='2025-07-01', end_date='2025-07-15',
            reason='Vacances', status='pending'
        )
        JobOffer.objects.create(
            title='Dev Senior', description='...', requirements='...',
            location='Abidjan', status='published', created_by=self.admin
        )
        PaySlip.objects.create(
            employee=self.emp_user, month=datetime.now().month, year=datetime.now().year,
            gross_salary=600000, net_salary=500000
        )
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/dashboard/stats/')
        self.assertEqual(res.data['employees_count'], 1)
        self.assertEqual(res.data['pending_leaves'], 1)
        self.assertEqual(res.data['active_offers'], 1)
        self.assertEqual(res.data['monthly_payroll'], 500000)

    def test_stats_no_data(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/dashboard/stats/')
        self.assertEqual(res.data['employees_count'], 1)
        self.assertEqual(res.data['pending_leaves'], 0)
        self.assertEqual(res.data['active_offers'], 0)
        self.assertEqual(res.data['monthly_payroll'], 0)

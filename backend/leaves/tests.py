from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User
from .models import LeaveType, Leave

class LeaveTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('admin', 'a@t.com', 'admin123', role='admin')
        self.emp = User.objects.create_user('emp', 'e@t.com', 'emp123', first_name='Jean', last_name='Koffi', role='employee')
        self.mgr = User.objects.create_user('mgr', 'm@t.com', 'mgr123', first_name='Marie', last_name='Diallo', role='manager')
        self.lt = LeaveType.objects.create(name='Annuel', default_days=30, is_paid=True)
        self.client.force_authenticate(user=self.emp)

    def test_create_leave_request(self):
        res = self.client.post('/api/leaves/', {
            'leave_type': self.lt.id, 'start_date': '2025-07-01',
            'end_date': '2025-07-15', 'reason': 'Vacances'
        })
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data['status'], 'pending')

    def test_my_leaves(self):
        Leave.objects.create(employee=self.emp, leave_type=self.lt, start_date='2025-07-01', end_date='2025-07-15', reason='Vac')
        res = self.client.get('/api/leaves/')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(res.data['count'], 1)

    def test_leave_types_list(self):
        res = self.client.get('/api/leaves/types/')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data), 1)

    def test_approve_leave(self):
        leave = Leave.objects.create(employee=self.emp, leave_type=self.lt, start_date='2025-07-01', end_date='2025-07-15', reason='Vac')
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(f'/api/leaves/{leave.id}/approve/', {'comment': 'OK'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['status'], 'approved')

    def test_reject_leave(self):
        leave = Leave.objects.create(employee=self.emp, leave_type=self.lt, start_date='2025-07-01', end_date='2025-07-15', reason='Vac')
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(f'/api/leaves/{leave.id}/reject/', {'comment': 'Non'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['status'], 'rejected')

    def test_calendar_endpoint(self):
        Leave.objects.create(employee=self.emp, leave_type=self.lt, start_date='2026-01-10', end_date='2026-01-20', reason='Vac', status='approved')
        res = self.client.get('/api/leaves/calendar/?month=1&year=2026')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data), 1)

from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User
from employees.models import Employee, Department, Position
from leaves.models import LeaveType, Leave
from .models import Notification


class NotificationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('admin', 'admin@t.com', 'admin123', role='admin')
        self.emp = User.objects.create_user('emp', 'emp@t.com', 'emp123', first_name='Jean', last_name='Koffi', role='employee')
        self.client.force_authenticate(user=self.emp)

    def test_list_notifications(self):
        Notification.objects.create(recipient=self.emp, title='Test', message='Hello')
        res = self.client.get('/api/notifications/')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data), 1)

    def test_unread_count(self):
        Notification.objects.create(recipient=self.emp, title='Unread', message='Not read')
        res = self.client.get('/api/notifications/unread_count/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['count'], 1)

    def test_mark_all_read(self):
        Notification.objects.create(recipient=self.emp, title='A', message='A')
        Notification.objects.create(recipient=self.emp, title='B', message='B')
        res = self.client.post('/api/notifications/mark_all_read/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(Notification.objects.filter(recipient=self.emp, is_read=False).count(), 0)

    def test_notification_created_on_leave(self):
        dept = Department.objects.create(name='IT')
        pos = Position.objects.create(title='Dev', department=dept)
        Employee.objects.create(user=self.emp, department=dept, position=pos, hire_date='2024-01-01')
        lt = LeaveType.objects.create(name='Annuel', default_days=30)
        self.client.force_authenticate(user=self.admin)
        leave = Leave.objects.create(employee=self.emp, leave_type=lt, start_date='2026-07-01', end_date='2026-07-15', reason='Vac')
        res = self.client.post(f'/api/leaves/{leave.id}/approve/', {'comment': 'OK'})
        self.assertEqual(res.status_code, 200)
        notif = Notification.objects.filter(recipient=self.emp).first()
        self.assertIsNotNone(notif)
        self.assertIn('approuvée', notif.title)

    def test_unauthenticated_cannot_access(self):
        self.client.force_authenticate(user=None)
        res = self.client.get('/api/notifications/')
        self.assertEqual(res.status_code, 401)

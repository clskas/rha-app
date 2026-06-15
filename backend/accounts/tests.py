from django.test import TestCase
from rest_framework.test import APIClient
from .models import User

class AuthTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('admin', 'admin@test.com', 'admin123', role='admin')
        self.rh = User.objects.create_user('rhuser', 'rh@test.com', 'rh123', first_name='Marie', last_name='Diallo', role='rh')
        self.emp = User.objects.create_user('empuser', 'emp@test.com', 'emp123', first_name='Jean', last_name='Koffi', role='employee')

    def test_login_success(self):
        res = self.client.post('/api/auth/login/', {'username': 'admin', 'password': 'admin123'})
        self.assertEqual(res.status_code, 200)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)

    def test_login_fail(self):
        res = self.client.post('/api/auth/login/', {'username': 'admin', 'password': 'wrong'})
        self.assertEqual(res.status_code, 401)

    def test_me_endpoint(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/auth/users/me/')
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['username'], 'admin')

    def test_register(self):
        res = self.client.post('/api/auth/register/', {
            'username': 'newuser', 'email': 'new@test.com', 'password': 'newpass123',
            'first_name': 'New', 'last_name': 'User', 'role': 'employee'
        })
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data['username'], 'newuser')

    def test_user_list_admin(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get('/api/auth/users/')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data['results']), 3)

    def test_user_list_employee_forbidden(self):
        self.client.force_authenticate(user=self.emp)
        res = self.client.get('/api/auth/users/')
        self.assertEqual(res.status_code, 403)

    def test_unauthenticated_access(self):
        res = self.client.get('/api/auth/users/')
        self.assertEqual(res.status_code, 401)

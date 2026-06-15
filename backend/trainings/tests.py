from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User
from .models import Training, TrainingRegistration


class TrainingTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('admin', 'admin@t.com', 'admin123', role='admin')
        self.emp = User.objects.create_user('emp', 'emp@t.com', 'emp123', first_name='Jean', last_name='Koffi', role='employee')

    def test_list_trainings(self):
        self.client.force_authenticate(user=self.emp)
        Training.objects.create(title='Python', description='...', trainer='M. X', start_date='2026-07-01', end_date='2026-07-05', max_participants=20)
        res = self.client.get('/api/trainings/')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(res.data['count'], 1)

    def test_create_training_admin(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.post('/api/trainings/', {
            'title': 'Django Avancé', 'description': 'Formation Django',
            'trainer': 'M. Y', 'start_date': '2026-08-01', 'end_date': '2026-08-05',
            'max_participants': 15, 'cost': 50000
        })
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data['title'], 'Django Avancé')

    def test_create_training_employee_forbidden(self):
        self.client.force_authenticate(user=self.emp)
        res = self.client.post('/api/trainings/', {
            'title': 'Test', 'description': 'Test',
            'trainer': 'M. Z', 'start_date': '2026-08-01', 'end_date': '2026-08-05',
            'max_participants': 10
        })
        self.assertEqual(res.status_code, 403)

    def test_register_for_training(self):
        self.client.force_authenticate(user=self.admin)
        training = Training.objects.create(title='Python', description='...', trainer='M. X', start_date='2026-07-01', end_date='2026-07-05', max_participants=20)
        self.client.force_authenticate(user=self.emp)
        res = self.client.post(f'/api/trainings/{training.id}/register/')
        self.assertEqual(res.status_code, 201)
        self.assertTrue(TrainingRegistration.objects.filter(training=training, employee=self.emp).exists())

    def test_approve_registration(self):
        self.client.force_authenticate(user=self.admin)
        training = Training.objects.create(title='Python', description='...', trainer='M. X', start_date='2026-07-01', end_date='2026-07-05', max_participants=20)
        reg = TrainingRegistration.objects.create(training=training, employee=self.emp)
        res = self.client.patch(f'/api/trainings/registrations/{reg.id}/approve/')
        self.assertEqual(res.status_code, 200)
        reg.refresh_from_db()
        self.assertEqual(reg.status, 'approved')

    def test_my_registrations(self):
        self.client.force_authenticate(user=self.admin)
        training = Training.objects.create(title='Python', description='...', trainer='M. X', start_date='2026-07-01', end_date='2026-07-05', max_participants=20)
        TrainingRegistration.objects.create(training=training, employee=self.emp)
        self.client.force_authenticate(user=self.emp)
        res = self.client.get('/api/trainings/my_registrations/')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data), 1)

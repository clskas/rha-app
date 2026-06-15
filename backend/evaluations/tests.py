from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User
from .models import EvaluationCampaign, Evaluation

class EvaluationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('admin', 'a@t.com', 'admin123', role='admin')
        self.emp = User.objects.create_user('emp', 'e@t.com', 'emp123', first_name='Jean', last_name='Koffi', role='employee')
        self.client.force_authenticate(user=self.admin)

    def test_create_campaign(self):
        res = self.client.post('/api/evaluations/campaigns/', {
            'title': 'Campagne 2025', 'start_date': '2025-06-01', 'end_date': '2025-07-01'
        })
        self.assertEqual(res.status_code, 201)

    def test_list_campaigns(self):
        EvaluationCampaign.objects.create(title='Campagne 2025', start_date='2025-06-01', end_date='2025-07-01', created_by=self.admin)
        res = self.client.get('/api/evaluations/campaigns/')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(len(res.data), 1)

    def test_create_evaluation(self):
        camp = EvaluationCampaign.objects.create(title='Campagne 2025', start_date='2025-06-01', end_date='2025-07-01', created_by=self.admin)
        res = self.client.post('/api/evaluations/', {
            'campaign': camp.id, 'employee': self.emp.id, 'evaluator': self.admin.id,
            'rating': 4, 'comments': 'Bon travail'
        })
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data['rating'], 4)

    def test_employee_sees_own_evaluations(self):
        camp = EvaluationCampaign.objects.create(title='Campagne 2025', start_date='2025-06-01', end_date='2025-07-01', created_by=self.admin)
        Evaluation.objects.create(campaign=camp, employee=self.emp, evaluator=self.admin, rating=4, comments='Bien')
        self.client.force_authenticate(user=self.emp)
        res = self.client.get('/api/evaluations/')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(res.data['count'], 1)

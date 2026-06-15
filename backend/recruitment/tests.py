from django.test import TestCase
from rest_framework.test import APIClient
from accounts.models import User
from employees.models import Department, Position
from .models import JobOffer, Candidate

class RecruitmentTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin = User.objects.create_superuser('admin', 'a@t.com', 'admin123', role='admin')
        self.dept = Department.objects.create(name='IT')
        self.pos = Position.objects.create(title='Dev', department=self.dept)
        self.client.force_authenticate(user=self.admin)

    def test_create_job_offer(self):
        res = self.client.post('/api/recruitment/offers/', {
            'title': 'Développeur Python', 'description': 'Poste de dev',
            'requirements': 'Python, Django', 'location': 'Abidjan', 'status': 'published'
        })
        self.assertEqual(res.status_code, 201)
        self.assertEqual(res.data['title'], 'Développeur Python')

    def test_list_offers(self):
        JobOffer.objects.create(title='Dev', description='...', requirements='...', location='Abidjan', created_by=self.admin)
        res = self.client.get('/api/recruitment/offers/')
        self.assertEqual(res.status_code, 200)
        self.assertGreaterEqual(res.data['count'], 1)

    def test_create_candidate(self):
        offer = JobOffer.objects.create(title='Dev', description='...', requirements='...', location='Abidjan', created_by=self.admin)
        res = self.client.post('/api/recruitment/candidates/', {
            'job_offer': offer.id, 'first_name': 'Alice', 'last_name': 'Konan',
            'email': 'alice@test.com', 'status': 'received'
        })
        self.assertEqual(res.status_code, 201)

    def test_update_candidate_status(self):
        offer = JobOffer.objects.create(title='Dev', description='...', requirements='...', location='Abidjan', created_by=self.admin)
        cand = Candidate.objects.create(job_offer=offer, first_name='Alice', last_name='Konan', email='a@t.com')
        res = self.client.patch(f'/api/recruitment/candidates/{cand.id}/', {'status': 'interviewed'})
        self.assertEqual(res.status_code, 200)
        self.assertEqual(res.data['status'], 'interviewed')

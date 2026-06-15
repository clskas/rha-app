from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers
from django.db.models import Sum, Count
from datetime import datetime, timedelta
from employees.models import Employee
from leaves.models import Leave
from recruitment.models import JobOffer
from payroll.models import PaySlip


class DashboardStatsSerializer(serializers.Serializer):
    employees_count = serializers.IntegerField()
    pending_leaves = serializers.IntegerField()
    active_offers = serializers.IntegerField()
    monthly_payroll = serializers.FloatField()
    payroll_currency = serializers.CharField()
    contract_stats = serializers.ListField()
    payroll_history = serializers.ListField()
    leave_by_status = serializers.ListField()

class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DashboardStatsSerializer

    def get(self, request):
        now = datetime.now()
        monthly = PaySlip.objects.filter(
            created_at__month=now.month,
            created_at__year=now.year
        )
        # Contract distribution
        contract_stats = Employee.objects.values('contract_type').annotate(count=Count('id'))
        # Monthly payroll for last 6 months
        payroll_history = []
        for i in range(5, -1, -1):
            m = now.month - i
            y = now.year
            if m <= 0:
                m += 12
                y -= 1
            total = PaySlip.objects.filter(month=m, year=y).aggregate(total=Sum('net_salary'))['total'] or 0
            payroll_history.append({'month': m, 'year': y, 'total': float(total)})
        # Leave stats by type
        leave_by_status = Leave.objects.values('status').annotate(count=Count('id'))
        stats = {
            'employees_count': Employee.objects.count(),
            'pending_leaves': Leave.objects.filter(status='pending').count(),
            'active_offers': JobOffer.objects.filter(status='published').count(),
            'monthly_payroll': monthly.aggregate(total=Sum('net_salary'))['total'] or 0,
            'payroll_currency': 'CDF',
            'contract_stats': list(contract_stats),
            'payroll_history': payroll_history,
            'leave_by_status': list(leave_by_status),
        }
        return Response(stats)

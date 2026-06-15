import csv, os, datetime
from django.http import HttpResponse, FileResponse
from django.conf import settings
from django.template.loader import render_to_string
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PaySlip, SalaryConfig
from .serializers import PaySlipSerializer, SalaryConfigSerializer
from permissions import IsAdminOrRHOrReadOnly, IsAdminOrRH

class PaySlipViewSet(viewsets.ModelViewSet):
    queryset = PaySlip.objects.select_related('employee').all()
    serializer_class = PaySlipSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrRHOrReadOnly]
    filterset_fields = ['month', 'year', 'is_paid']

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'employee':
            return qs.filter(employee=user)
        return qs

    @action(detail=False, methods=['post'], url_path='calculate', permission_classes=[IsAdminOrRH])
    def calculate(self, request):
        from .utils import calculate_net_salary
        from decimal import Decimal, InvalidOperation

        gross_salary = request.data.get('gross_salary')
        bonuses = request.data.get('bonuses', 0)
        deductions = request.data.get('deductions', 0)
        currency = request.data.get('currency', 'CDF')

        try:
            gross_salary = Decimal(str(gross_salary))
            bonuses = Decimal(str(bonuses))
            deductions = Decimal(str(deductions))
        except (InvalidOperation, TypeError, ValueError):
            return Response({'error': 'Montants invalides'}, status=status.HTTP_400_BAD_REQUEST)

        result = calculate_net_salary(gross_salary, bonuses, deductions)
        result['currency'] = currency
        return Response(result, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='generate-pdf')
    def generate_pdf(self, request, pk=None):
        try:
            from reportlab.lib.pagesizes import A4
            from reportlab.pdfgen import canvas
            from reportlab.lib.units import cm
            payslip = self.get_object()
            filename = f'payslip_{payslip.id}_{payslip.month}_{payslip.year}.pdf'
            filepath = os.path.join(settings.MEDIA_ROOT, 'payslips', filename)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            c = canvas.Canvas(filepath, pagesize=A4)
            w, h = A4
            c.setFont("Helvetica-Bold", 20)
            c.drawString(2*cm, h - 2*cm, "BULLETIN DE PAIE")
            c.setFont("Helvetica", 10)
            c.drawString(2*cm, h - 3*cm, f"Période : {payslip.month}/{payslip.year}")
            c.drawString(2*cm, h - 3.5*cm, f"Employé : {payslip.employee.get_full_name()}")
            c.drawString(2*cm, h - 4*cm, f"Email : {payslip.employee.email}")
            c.line(2*cm, h - 4.5*cm, w - 2*cm, h - 4.5*cm)
            y = h - 5.5*cm
            items = [
                ("Salaire brut", f"{payslip.gross_salary:,.0f} {payslip.currency}"),
                ("Primes", f"{payslip.bonuses:,.0f} {payslip.currency}"),
                ("Déductions", f"{payslip.deductions:,.0f} {payslip.currency}"),
                ("Impôts", f"{payslip.taxes:,.0f} {payslip.currency}"),
                ("", ""),
                ("Salaire net", f"{payslip.net_salary:,.0f} {payslip.currency}"),
            ]
            for label_text, value_text in items:
                c.setFont("Helvetica-Bold" if label_text == "Salaire net" else "Helvetica", 12 if label_text == "Salaire net" else 10)
                c.drawString(2*cm, y, label_text)
                c.drawRightString(w - 2*cm, y, value_text)
                y -= 0.8*cm
            c.line(2*cm, y, w - 2*cm, y)
            c.setFont("Helvetica", 8)
            c.drawString(2*cm, 1*cm, "Généré par RHA - Ressource Humaine App")
            c.save()
            payslip.pdf_file.name = f'payslips/{filename}'
            payslip.save(update_fields=['pdf_file'])
            return Response({'pdf_url': payslip.pdf_file.url if hasattr(payslip.pdf_file, 'url') else f'/media/payslips/{filename}'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['get'], url_path='export-csv')
    def export_csv(self, request):
        qs = self.get_queryset().select_related('employee')
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = 'attachment; filename="paie.csv"'
        writer = csv.writer(response)
        writer.writerow(['Employé', 'Mois', 'Année', 'Salaire brut', 'Salaire net', 'Devise', 'Payé'])
        for p in qs:
            writer.writerow([
                p.employee.get_full_name(), p.month, p.year,
                p.gross_salary, p.net_salary, p.currency,
                'Oui' if p.is_paid else 'Non',
            ])
        return response

    @action(detail=False, methods=['post'], url_path='bulk-generate', permission_classes=[IsAdminOrRH])
    def bulk_generate(self, request):
        from .utils import calculate_net_salary
        from employees.models import Employee

        month = request.data.get('month')
        year = request.data.get('year')
        currency = request.data.get('currency', 'CDF')

        if not month or not year:
            return Response({'error': 'month et year requis'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            month = int(month)
            year = int(year)
        except (ValueError, TypeError):
            return Response({'error': 'month et year doivent être des entiers'}, status=status.HTTP_400_BAD_REQUEST)

        if month < 1 or month > 12:
            return Response({'error': 'month doit être entre 1 et 12'}, status=status.HTTP_400_BAD_REQUEST)

        if currency not in ['CDF', 'USD', 'XOF']:
            return Response({'error': 'Devise invalide'}, status=status.HTTP_400_BAD_REQUEST)

        employees = Employee.objects.select_related('user').all()
        existing_ids = set(PaySlip.objects.filter(month=month, year=year).values_list('employee_id', flat=True))

        created = 0
        errors = []

        for emp in employees:
            user = emp.user
            if user.id in existing_ids:
                continue
            gross = emp.salary
            if not gross or gross <= 0:
                errors.append(f"{user.get_full_name()}: Salaire invalide ({gross})")
                continue
            try:
                result = calculate_net_salary(gross)
                PaySlip.objects.create(
                    employee=user, month=month, year=year,
                    gross_salary=gross, net_salary=result['net_salary'],
                    taxes=result['taxes'], cnss=result['cnss_employee'],
                    cnss_employer=result['cnss_employer'],
                    bonuses=0, deductions=0, currency=currency,
                )
                created += 1
            except Exception as e:
                errors.append(f"{user.get_full_name()}: {str(e)}")

        return Response({'created': created, 'errors': errors})

    @action(detail=False, methods=['get'], url_path='pending-months')
    def pending_months(self, request):
        from employees.models import Employee

        total = Employee.objects.count()
        if total == 0:
            return Response([])

        today = datetime.date.today()
        candidates = set()
        candidates.add((today.month, today.year))
        for i in range(1, 12):
            m = today.month - i
            y = today.year
            if m <= 0:
                m += 12
                y -= 1
            candidates.add((m, y))

        for entry in PaySlip.objects.values('month', 'year').distinct():
            candidates.add((entry['month'], entry['year']))

        results = []
        for month, year in candidates:
            existing = PaySlip.objects.filter(month=month, year=year).values('employee').distinct().count()
            missing = total - existing
            if missing > 0:
                results.append({'month': month, 'year': year, 'employee_count': missing})

        results.sort(key=lambda x: (x['year'], x['month']), reverse=True)
        return Response(results)

class SalaryConfigViewSet(viewsets.ModelViewSet):
    queryset = SalaryConfig.objects.select_related('position').all()
    serializer_class = SalaryConfigSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrRH]
    filterset_fields = ['position']

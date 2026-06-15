import csv
import calendar
from datetime import date
from django.http import HttpResponse
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import LeaveType, Leave
from .serializers import LeaveTypeSerializer, LeaveSerializer
from permissions import IsAdminOrRHOrReadOnly

class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrRHOrReadOnly]
    pagination_class = None

class LeaveViewSet(viewsets.ModelViewSet):
    queryset = Leave.objects.select_related('employee', 'leave_type', 'approved_by').all()
    serializer_class = LeaveSerializer
    filterset_fields = ['status', 'leave_type']
    search_fields = ['employee__first_name', 'employee__last_name']

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset()
        if user.role == 'employee':
            return qs.filter(employee=user)
        if user.role == 'manager':
            return qs.filter(employee__employee_profile__manager__user=user)
        return qs

    def perform_create(self, serializer):
        serializer.save(employee=self.request.user, status='pending')

    @action(detail=False, methods=['get'], url_path='export-csv')
    def export_csv(self, request):
        qs = self.get_queryset().select_related('employee', 'leave_type', 'approved_by')
        response = HttpResponse(content_type='text/csv; charset=utf-8-sig')
        response['Content-Disposition'] = 'attachment; filename="conges.csv"'
        writer = csv.writer(response)
        writer.writerow(['Employé', 'Type', 'Début', 'Fin', 'Statut', 'Motif', 'Approuvé par'])
        for l in qs:
            writer.writerow([
                l.employee.get_full_name(), l.leave_type.name if l.leave_type else '',
                l.start_date, l.end_date, l.get_status_display(), l.reason,
                l.approved_by.get_full_name() if l.approved_by else '',
            ])
        return response

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        leave = self.get_object()
        if request.user.role not in ['admin', 'rh', 'manager']:
            return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
        leave.status = 'approved'
        leave.approved_by = request.user
        leave.comment = request.data.get('comment', '')
        leave.save()
        return Response(LeaveSerializer(leave).data)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        leave = self.get_object()
        if request.user.role not in ['admin', 'rh', 'manager']:
            return Response({'error': 'Permission refusée'}, status=status.HTTP_403_FORBIDDEN)
        leave.status = 'rejected'
        leave.approved_by = request.user
        leave.comment = request.data.get('comment', '')
        leave.save()
        return Response(LeaveSerializer(leave).data)

    @action(detail=False, methods=['get'], url_path='calendar')
    def calendar(self, request):
        today = date.today()
        month = int(request.query_params.get('month', today.month))
        year = int(request.query_params.get('year', today.year))
        first_day = date(year, month, 1)
        last_day = date(year, month, calendar.monthrange(year, month)[1])
        leaves = self.get_queryset().filter(
            status='approved',
            start_date__lte=last_day,
            end_date__gte=first_day,
        )
        data = []
        for l in leaves:
            data.append({
                'id': l.id,
                'employee_name': l.employee.get_full_name(),
                'leave_type_name': l.leave_type.name if l.leave_type else '',
                'start_date': str(l.start_date),
                'end_date': str(l.end_date),
                'color': l.leave_type.color if l.leave_type else '#3B82F6',
            })
        return Response(data)

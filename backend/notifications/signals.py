from django.db.models.signals import post_save
from django.dispatch import receiver
from leaves.models import Leave
from employees.models import Employee
from .models import Notification
from .email_utils import send_notification_email

@receiver(post_save, sender=Leave)
def notify_leave_update(sender, instance, created, **kwargs):
    try:
        emp = Employee.objects.get(user=instance.employee)
    except Employee.DoesNotExist:
        return
    if created:
        if emp.manager:
            notif = Notification.objects.create(
                recipient=emp.manager.user,
                title='Nouvelle demande de congé',
                message=f"{emp.get_full_name()} a demandé un congé du {instance.start_date} au {instance.end_date}",
                link='/leaves'
            )
            send_notification_email(
                recipient_email=emp.manager.user.email,
                subject=notif.title,
                message=notif.message,
                link=notif.link,
            )
    elif instance.status in ('approved', 'rejected'):
        label = 'approuvée' if instance.status == 'approved' else 'refusée'
        notif = Notification.objects.create(
            recipient=instance.employee,
            title=f'Demande de congé {label}',
            message=f"Votre demande de congé du {instance.start_date} au {instance.end_date} a été {label}.",
            link='/leaves'
        )
        send_notification_email(
            recipient_email=instance.employee.email,
            subject=notif.title,
            message=notif.message,
            link=notif.link,
        )
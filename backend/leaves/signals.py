from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Leave

@receiver(post_save, sender=Leave)
def notify_leave_status(sender, instance, created, **kwargs):
    subject = None
    message = None
    recipient = instance.employee.email
    recipients = []

    if created:
        try:
            manager = instance.employee.employee_profile.manager
            if manager:
                recipients = [manager.user.email]
        except Exception:
            recipients = []
        if recipients:
            subject = f"[RHA] Demande de congé - {instance.employee.get_full_name()}"
            message = f"""
Bonjour,

{instance.employee.get_full_name()} a soumis une demande de congé.

Type : {instance.leave_type.name}
Du : {instance.start_date}
Au : {instance.end_date}
Motif : {instance.reason}

Connectez-vous pour approuver ou refuser cette demande.

Équipe RHA
"""
    else:
        recipients = [recipient]
        if instance.status == 'approved':
            subject = f"[RHA] Congé approuvé - {instance.leave_type.name}"
            message = f"""
Bonjour {instance.employee.first_name},

Votre demande de congé ({instance.leave_type.name}) du {instance.start_date} au {instance.end_date} a été approuvée.

Commentaire : {instance.comment or 'Aucun'}

Bonnes vacances !
Équipe RHA
"""
        elif instance.status == 'rejected':
            subject = f"[RHA] Congé refusé - {instance.leave_type.name}"
            message = f"""
Bonjour {instance.employee.first_name},

Votre demande de congé ({instance.leave_type.name}) du {instance.start_date} au {instance.end_date} a été refusée.

Motif : {instance.comment or 'Aucun'}

N'hésitez pas à contacter votre responsable pour plus d'informations.

Équipe RHA
"""

    if subject and message and recipients and settings.EMAIL_HOST:
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, recipients, fail_silently=True)

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from leaves.models import Leave


@receiver(post_save, sender=Leave)
def log_leave_action(sender, instance, created, **kwargs):
    from .models import AuditLog
    if created:
        action = 'create'
        details = f"{instance.employee.get_full_name()} a créé une demande de congé ({instance.leave_type.name})"
    elif instance.status in ('approved', 'rejected'):
        action = instance.status
        details = f"Demande de congé {instance.status} pour {instance.employee.get_full_name()}"
    else:
        return
    AuditLog.objects.create(
        user=instance.employee if created else instance.approved_by,
        action=action,
        model_name='Leave',
        object_id=instance.id,
        details=details
    )

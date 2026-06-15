from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string


def send_notification_email(recipient_email, subject, message, link=None):
    if not recipient_email:
        return False
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;font-family:Arial,sans-serif;background-color:#f4f4f4">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:20px">
            <tr>
                <td align="center">
                    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden">
                        <tr>
                            <td style="background-color:#1e3a5f;padding:20px;text-align:center">
                                <h1 style="color:#ffffff;margin:0;font-size:20px">Ressource Humaine App</h1>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:30px;color:#333">
                                <h2 style="margin:0 0 15px;font-size:18px">{subject}</h2>
                                <p style="margin:0 0 15px;line-height:1.6;font-size:14px">{message}</p>
                                {f'<p style="margin:0 0 15px;text-align:center"><a href="{link}" style="display:inline-block;background-color:#1e3a5f;color:#ffffff;padding:10px 25px;text-decoration:none;border-radius:4px;font-size:14px">Voir la notification</a></p>' if link else ''}
                            </td>
                        </tr>
                        <tr>
                            <td style="background-color:#f4f4f4;padding:15px;text-align:center;color:#999;font-size:12px">
                                Ce message est automatique, merci de ne pas y répondre.
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """
    try:
        send_mail(
            subject=subject,
            message=message,
            html_message=html_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        return True
    except Exception:
        return False

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView, SpectacularRedocView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/employees/', include('employees.urls')),
    path('api/leaves/', include('leaves.urls')),
    path('api/payroll/', include('payroll.urls')),
    path('api/recruitment/', include('recruitment.urls')),
    path('api/evaluations/', include('evaluations.urls')),
    path('api/dashboard/', include('dashboard.urls')),
    path('api/audit/', include('audit.urls')),
    path('api/', include('notifications.urls')),
    path('api/trainings/', include('trainings.urls')),
    path('api/polls/', include('polls.urls')),
    path('api/announcements/', include('announcements.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

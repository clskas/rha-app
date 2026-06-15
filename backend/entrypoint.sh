#!/bin/sh

if [ "$DATABASE_URL" != "" ]; then
    echo "Waiting for PostgreSQL..."
    while ! nc -z $DB_HOST $DB_PORT; do
        sleep 0.1
    done
    echo "PostgreSQL ready"
fi

python manage.py migrate --noinput

if [ "$DJANGO_SUPERUSER_USERNAME" ]; then
    python manage.py shell -c "
from accounts.models import User
if not User.objects.filter(username='$DJANGO_SUPERUSER_USERNAME').exists():
    User.objects.create_superuser('$DJANGO_SUPERUSER_USERNAME', '$DJANGO_SUPERUSER_EMAIL', '$DJANGO_SUPERUSER_PASSWORD', role='admin')
"
fi

exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4

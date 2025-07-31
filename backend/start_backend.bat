@echo off
echo Starting Numerizam Django Backend...
echo.

cd /d "%~dp0"

echo Installing dependencies...
pip install -r requirements.txt

echo.
echo Running migrations...
python manage.py migrate

echo.
echo Creating superuser (if not exists)...
echo from django.contrib.auth.models import User; User.objects.get_or_create(username='admin', defaults={'email': 'admin@numerizam.com', 'is_staff': True, 'is_superuser': True}) | python manage.py shell

echo.
echo Starting Django development server...
echo Backend will be available at: http://127.0.0.1:8000/
echo Admin interface: http://127.0.0.1:8000/admin/
echo API endpoints: http://127.0.0.1:8000/api/
echo.
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver 127.0.0.1:8000
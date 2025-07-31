"""
Django management command to create admin user in numerizamauth table.
"""

from django.core.management.base import BaseCommand
from django.db import connection
from django.utils import timezone


class Command(BaseCommand):
    help = 'Create admin user in numerizamauth table'

    def handle(self, *args, **options):
        """Create the admin user directly in the database."""
        
        try:
            with connection.cursor() as cursor:
                # Check if admin user already exists
                cursor.execute(
                    "SELECT id FROM numerizamauth WHERE email = %s",
                    ['shuvo@admin.com']
                )
                
                if cursor.fetchone():
                    self.stdout.write(
                        self.style.WARNING('Admin user already exists!')
                    )
                    return
                
                # Insert admin user
                cursor.execute("""
                    INSERT INTO numerizamauth (
                        email, name, role, company_name, country, region, 
                        is_approved, created_at, updated_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, [
                    'shuvo@admin.com',
                    'Admin User',
                    'Admin',
                    'Numerizam Admin',
                    'Bangladesh',
                    'Dhaka',
                    True,
                    timezone.now(),
                    timezone.now()
                ])
                
                self.stdout.write(
                    self.style.SUCCESS('✅ Admin user created successfully!')
                )
                self.stdout.write('Email: shuvo@admin.com')
                self.stdout.write('Password: 123456')
                self.stdout.write('')
                self.stdout.write('Note: You still need to create the auth user in Supabase Auth.')
                self.stdout.write('Try logging in from the frontend to trigger auth user creation.')
                
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'❌ Error creating admin user: {str(e)}')
            )
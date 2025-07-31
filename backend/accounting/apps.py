"""
Django app configuration for the accounting application.
"""

from django.apps import AppConfig


class AccountingConfig(AppConfig):
    """Configuration for the accounting app."""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounting'
    verbose_name = 'Numerizam Accounting'
    
    def ready(self):
        """
        Perform initialization tasks when the app is ready.
        This method is called when Django starts.
        """
        # Import signal handlers if any
        # import accounting.signals
        pass
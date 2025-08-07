from django.core.management.base import BaseCommand
from accounting.models import Company, ChartOfAccounts


class Command(BaseCommand):
    help = 'Create a default company for testing'

    def handle(self, *args, **options):
        # Create default company if it doesn't exist
        company, created = Company.objects.get_or_create(
            company_id=1,
            defaults={'company_name': 'Patrick Incitti'}
        )
        
        if created:
            self.stdout.write(
                self.style.SUCCESS(f'Successfully created company: {company.company_name}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'Company already exists: {company.company_name}')
            )

        # Create basic chart of accounts
        accounts = [
            {
                'account_key': 1001,
                'report': 'Balance Sheet',
                'class_name': 'Assets',
                'sub_class': 'Current Assets',
                'sub_class2': 'Cash and Cash Equivalents',
                'account': 'Cash',
                'sub_account': 'Petty Cash'
            },
            {
                'account_key': 3001,
                'report': 'Balance Sheet',
                'class_name': 'Equity',
                'sub_class': 'Owner Equity',
                'sub_class2': 'Capital',
                'account': 'Owner Capital',
                'sub_account': 'Initial Investment'
            },
            {
                'account_key': 4001,
                'report': 'Income Statement',
                'class_name': 'Revenue',
                'sub_class': 'Operating Revenue',
                'sub_class2': 'Service Revenue',
                'account': 'Legal Services Revenue',
                'sub_account': 'Consultation Fees'
            },
            {
                'account_key': 5001,
                'report': 'Income Statement',
                'class_name': 'Expenses',
                'sub_class': 'Operating Expenses',
                'sub_class2': 'General Expenses',
                'account': 'Office Expenses',
                'sub_account': 'General Office'
            }
        ]

        for account_data in accounts:
            account, created = ChartOfAccounts.objects.get_or_create(
                company=company,
                account_key=account_data['account_key'],
                defaults={
                    'report': account_data['report'],
                    'class_name': account_data['class_name'],
                    'sub_class': account_data['sub_class'],
                    'sub_class2': account_data['sub_class2'],
                    'account': account_data['account'],
                    'sub_account': account_data['sub_account'],
                }
            )
            if created:
                self.stdout.write(f"Created account: {account.account}")
            else:
                self.stdout.write(f"Account already exists: {account.account}")
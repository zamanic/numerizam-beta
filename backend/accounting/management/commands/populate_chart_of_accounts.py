from django.core.management.base import BaseCommand
from accounting.models import Company, ChartOfAccounts


class Command(BaseCommand):
    help = 'Populate chart of accounts for all companies'

    def handle(self, *args, **options):
        # Chart of accounts data from the TypeScript file
        chart_of_accounts = [
            # Assets
            {"account_key": 1000, "account": "Cash", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},
            {"account_key": 1001, "account": "Petty cash", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},
            {"account_key": 1002, "account": "Cash in bank", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},
            {"account_key": 1003, "account": "Savings account", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},
            {"account_key": 1010, "account": "Accounts receivable", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},
            {"account_key": 1011, "account": "Allowance for doubtful accounts", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},
            {"account_key": 1012, "account": "Other receivables", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},
            {"account_key": 1013, "account": "Interest receivable", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},
            {"account_key": 1014, "account": "Rent receivable", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},
            {"account_key": 1020, "account": "Inventory", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},
            {"account_key": 1021, "account": "Raw materials", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},
            {"account_key": 1022, "account": "Work in process", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},
            {"account_key": 1023, "account": "Finished goods", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},
            {"account_key": 1030, "account": "Office supplies", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},
            {"account_key": 1031, "account": "Store supplies", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},
            {"account_key": 1040, "account": "Prepaid insurance", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},
            {"account_key": 1041, "account": "Prepaid rent", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},
            {"account_key": 1042, "account": "Prepaid advertising", "class": "Asset", "subclass": "Current Asset", "report": "Balance Sheet"},

            # Long-term Assets
            {"account_key": 1100, "account": "Long-term investments", "class": "Asset", "subclass": "Long Term Asset", "report": "Balance Sheet"},
            {"account_key": 1200, "account": "Land", "class": "Asset", "subclass": "Fixed Asset", "report": "Balance Sheet"},
            {"account_key": 1205, "account": "Land", "class": "Asset", "subclass": "Fixed Asset", "report": "Balance Sheet"},
            {"account_key": 1210, "account": "Buildings", "class": "Asset", "subclass": "Fixed Asset", "report": "Balance Sheet"},
            {"account_key": 1220, "account": "Office equipment", "class": "Asset", "subclass": "Fixed Asset", "report": "Balance Sheet"},

            # Liabilities
            {"account_key": 2000, "account": "Accounts payable", "class": "Liability", "subclass": "Current Liability", "report": "Balance Sheet"},
            {"account_key": 2001, "account": "Notes payable", "class": "Liability", "subclass": "Current Liability", "report": "Balance Sheet"},
            {"account_key": 2002, "account": "Interest payable", "class": "Liability", "subclass": "Current Liability", "report": "Balance Sheet"},
            {"account_key": 2003, "account": "Wages payable", "class": "Liability", "subclass": "Current Liability", "report": "Balance Sheet"},
            {"account_key": 2004, "account": "Unearned revenue", "class": "Liability", "subclass": "Current Liability", "report": "Balance Sheet"},

            # Owner's Equity
            {"account_key": 3000, "account": "Owner's Capital", "class": "Owner's Equity", "subclass": "Owner's Equity", "report": "Balance Sheet"},
            {"account_key": 3001, "account": "Partner's Capital A/c", "class": "Owner's Equity", "subclass": "Owner's Equity", "report": "Balance Sheet"},
            {"account_key": 3002, "account": "Capital", "class": "Owner's Equity", "subclass": "Owner's Equity", "report": "Balance Sheet"},
            {"account_key": 3003, "account": "Retained Earnings", "class": "Owner's Equity", "subclass": "Owner's Equity", "report": "Balance Sheet"},
            {"account_key": 3004, "account": "Drawings / Withdrawal", "class": "Owner's Equity", "subclass": "Owner's Equity", "report": "Balance Sheet"},
            {"account_key": 3007, "account": "Owner's Draw", "class": "Owner's Equity", "subclass": "Owner's Equity", "report": "Balance Sheet"},

            # Revenue
            {"account_key": 4000, "account": "Sales Revenue", "class": "Revenue", "subclass": "Operating Revenue", "report": "Profit and Loss"},
            {"account_key": 4001, "account": "Sales", "class": "Revenue", "subclass": "Operating Revenue", "report": "Profit and Loss"},
            {"account_key": 4002, "account": "Sales returns and allowances", "class": "Revenue", "subclass": "Operating Revenue", "report": "Profit and Loss"},
            {"account_key": 4003, "account": "Sales discounts", "class": "Revenue", "subclass": "Operating Revenue", "report": "Profit and Loss"},
            {"account_key": 4004, "account": "Services revenue", "class": "Revenue", "subclass": "Operating Revenue", "report": "Profit and Loss"},

            # Expenses
            {"account_key": 5000, "account": "Cost of Goods Sold", "class": "Expense", "subclass": "Cost of Sales", "report": "Profit and Loss"},
            {"account_key": 5001, "account": "Purchases", "class": "Expense", "subclass": "Cost of Sales", "report": "Profit and Loss"},
            {"account_key": 5100, "account": "Operating Expenses", "class": "Expense", "subclass": "Operating Expense", "report": "Profit and Loss"},
            {"account_key": 5101, "account": "Rent expense-Office space", "class": "Expense", "subclass": "Operating Expense", "report": "Profit and Loss"},
            {"account_key": 5102, "account": "Salaries expense", "class": "Expense", "subclass": "Operating Expense", "report": "Profit and Loss"},
            {"account_key": 5120, "account": "Office Supplies", "class": "Expense", "subclass": "Operating Expense", "report": "Profit and Loss"},
            {"account_key": 5121, "account": "Office supplies expense", "class": "Expense", "subclass": "Operating Expense", "report": "Profit and Loss"},
            {"account_key": 6000, "account": "Office Supplies Expense", "class": "Expense", "subclass": "Operating Expense", "report": "Profit and Loss"},
        ]

        companies = Company.objects.all()
        
        for company in companies:
            self.stdout.write(f"Populating chart of accounts for company: {company.company_name}")
            
            for account_data in chart_of_accounts:
                account, created = ChartOfAccounts.objects.get_or_create(
                    company=company,
                    account_key=account_data["account_key"],
                    defaults={
                        'account': account_data["account"],
                        'class_name': account_data["class"],
                        'sub_class': account_data["subclass"],
                        'report': account_data["report"]
                    }
                )
                
                if created:
                    self.stdout.write(f"  Created: {account.account_key} - {account.account}")
                else:
                    self.stdout.write(f"  Exists: {account.account_key} - {account.account}")
        
        self.stdout.write(self.style.SUCCESS('Successfully populated chart of accounts'))
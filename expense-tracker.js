# Expense Tracker CLI

A simple command-line expense tracker application to manage your finances.

## Features

- ✅ Add, update, and delete expenses
- ✅ View all expenses with optional category filtering
- ✅ Generate expense summaries (total and monthly)
- ✅ Set monthly budgets with spending warnings
- ✅ Export expenses to CSV
- ✅ Categorize expenses
- ✅ Data persistence using JSON files

## Installation

1. Make the script executable:
   \`\`\`bash
   chmod +x scripts/expense-tracker.js
   \`\`\`

2. Run commands using Node.js:
   \`\`\`bash
   node scripts/expense-tracker.js <command> [options]
   \`\`\`

## Usage Examples

### Add Expenses
\`\`\`bash
node scripts/expense-tracker.js add --description "Lunch" --amount 20
node scripts/expense-tracker.js add --description "Dinner" --amount 10 --category "Food"
\`\`\`

### List Expenses
\`\`\`bash
node scripts/expense-tracker.js list
node scripts/expense-tracker.js list --category "Food"
\`\`\`

### View Summary
\`\`\`bash
node scripts/expense-tracker.js summary
node scripts/expense-tracker.js summary --month 8
node scripts/expense-tracker.js summary --category "Food"
\`\`\`

### Update Expense
\`\`\`bash
node scripts/expense-tracker.js update --id 1 --description "Business Lunch" --amount 25
\`\`\`

### Delete Expense
\`\`\`bash
node scripts/expense-tracker.js delete --id 2
\`\`\`

### Set Budget
\`\`\`bash
node scripts/expense-tracker.js budget --month 8 --amount 1000
\`\`\`

### Export to CSV
\`\`\`bash
node scripts/expense-tracker.js export --file "expenses.csv"
\`\`\`

## Data Storage

- Expenses are stored in `expenses.json`
- Budgets are stored in `budgets.json`
- Both files are created automatically when needed

## Error Handling

The application includes comprehensive error handling for:
- Invalid amounts (negative or non-numeric)
- Non-existent expense IDs
- Missing required arguments
- Invalid month numbers
- File system errors

#!/usr/bin/env node

import fs from "fs"

const DATA_FILE = "expenses.json"

// Utility functions
function loadExpenses() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf8")
      return JSON.parse(data)
    }
  } catch (error) {
    console.error("Error loading expenses:", error.message)
  }
  return []
}

function saveExpenses(expenses) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(expenses, null, 2))
  } catch (error) {
    console.error("Error saving expenses:", error.message)
  }
}

function getNextId(expenses) {
  return expenses.length > 0 ? Math.max(...expenses.map((e) => e.id)) + 1 : 1
}

function formatDate(date) {
  return date.toISOString().split("T")[0]
}

function formatCurrency(amount) {
  return `$${amount}`
}

function validateAmount(amount) {
  const num = Number.parseFloat(amount)
  if (isNaN(num) || num <= 0) {
    throw new Error("Amount must be a positive number")
  }
  return num
}

function findExpenseById(expenses, id) {
  const expense = expenses.find((e) => e.id === Number.parseInt(id))
  if (!expense) {
    throw new Error(`Expense with ID ${id} not found`)
  }
  return expense
}

// Command implementations
function addExpense(args) {
  const expenses = loadExpenses()

  const description = getArgValue(args, "--description")
  const amount = getArgValue(args, "--amount")
  const category = getArgValue(args, "--category") || "General"

  if (!description) {
    throw new Error("Description is required (--description)")
  }

  if (!amount) {
    throw new Error("Amount is required (--amount)")
  }

  const validatedAmount = validateAmount(amount)

  const expense = {
    id: getNextId(expenses),
    date: formatDate(new Date()),
    description: description.trim(),
    amount: validatedAmount,
    category: category.trim(),
  }

  expenses.push(expense)
  saveExpenses(expenses)

  console.log(`Expense added successfully (ID: ${expense.id})`)
}

function updateExpense(args) {
  const expenses = loadExpenses()

  const id = getArgValue(args, "--id")
  const description = getArgValue(args, "--description")
  const amount = getArgValue(args, "--amount")
  const category = getArgValue(args, "--category")

  if (!id) {
    throw new Error("Expense ID is required (--id)")
  }

  const expense = findExpenseById(expenses, id)

  if (description) expense.description = description.trim()
  if (amount) expense.amount = validateAmount(amount)
  if (category) expense.category = category.trim()

  saveExpenses(expenses)
  console.log(`Expense updated successfully (ID: ${id})`)
}

function deleteExpense(args) {
  const expenses = loadExpenses()

  const id = getArgValue(args, "--id")
  if (!id) {
    throw new Error("Expense ID is required (--id)")
  }

  const index = expenses.findIndex((e) => e.id === Number.parseInt(id))
  if (index === -1) {
    throw new Error(`Expense with ID ${id} not found`)
  }

  expenses.splice(index, 1)
  saveExpenses(expenses)

  console.log("Expense deleted successfully")
}

function listExpenses(args) {
  const expenses = loadExpenses()
  const category = getArgValue(args, "--category")

  let filteredExpenses = expenses
  if (category) {
    filteredExpenses = expenses.filter((e) => e.category.toLowerCase() === category.toLowerCase())
  }

  if (filteredExpenses.length === 0) {
    console.log("No expenses found")
    return
  }

  console.log("ID  Date       Description                Amount    Category")
  console.log("--  ---------- -------------------------- --------- ----------")

  filteredExpenses.forEach((expense) => {
    const id = expense.id.toString().padEnd(2)
    const date = expense.date.padEnd(10)
    const description = expense.description.padEnd(26)
    const amount = formatCurrency(expense.amount).padEnd(9)
    const category = expense.category

    console.log(`${id}  ${date} ${description} ${amount} ${category}`)
  })
}

function showSummary(args) {
  const expenses = loadExpenses()
  const month = getArgValue(args, "--month")
  const category = getArgValue(args, "--category")

  let filteredExpenses = expenses
  let summaryLabel = "Total expenses"

  if (month) {
    const currentYear = new Date().getFullYear()
    const monthNum = Number.parseInt(month)

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      throw new Error("Month must be a number between 1 and 12")
    }

    filteredExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date)
      return expenseDate.getFullYear() === currentYear && expenseDate.getMonth() + 1 === monthNum
    })

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]
    summaryLabel = `Total expenses for ${monthNames[monthNum - 1]}`
  }

  if (category) {
    filteredExpenses = filteredExpenses.filter((e) => e.category.toLowerCase() === category.toLowerCase())
    summaryLabel += ` (${category})`
  }

  const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  console.log(`${summaryLabel}: ${formatCurrency(total)}`)

  // Show category breakdown if no specific category filter
  if (!category && filteredExpenses.length > 0) {
    const categoryTotals = {}
    filteredExpenses.forEach((expense) => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount
    })

    console.log("\nBreakdown by category:")
    Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .forEach(([cat, amount]) => {
        console.log(`  ${cat}: ${formatCurrency(amount)}`)
      })
  }
}

function setBudget(args) {
  const month = getArgValue(args, "--month")
  const amount = getArgValue(args, "--amount")

  if (!month || !amount) {
    throw new Error("Both --month and --amount are required")
  }

  const monthNum = Number.parseInt(month)
  if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
    throw new Error("Month must be a number between 1 and 12")
  }

  const budgetAmount = validateAmount(amount)

  // Load existing budgets
  let budgets = {}
  try {
    if (fs.existsSync("budgets.json")) {
      budgets = JSON.parse(fs.readFileSync("budgets.json", "utf8"))
    }
  } catch (error) {
    console.error("Error loading budgets:", error.message)
  }

  const currentYear = new Date().getFullYear()
  const key = `${currentYear}-${monthNum}`
  budgets[key] = budgetAmount

  fs.writeFileSync("budgets.json", JSON.stringify(budgets, null, 2))

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  console.log(`Budget set for ${monthNames[monthNum - 1]}: ${formatCurrency(budgetAmount)}`)

  // Check current spending against budget
  const expenses = loadExpenses()
  const currentMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.date)
    return expenseDate.getFullYear() === currentYear && expenseDate.getMonth() + 1 === monthNum
  })

  const currentSpending = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (currentSpending > budgetAmount) {
    console.log(`⚠️  WARNING: You have exceeded your budget by ${formatCurrency(currentSpending - budgetAmount)}`)
  } else {
    const remaining = budgetAmount - currentSpending
    console.log(`💰 Remaining budget: ${formatCurrency(remaining)}`)
  }
}

function exportToCsv(args) {
  const expenses = loadExpenses()
  const filename = getArgValue(args, "--file") || "expenses.csv"

  if (expenses.length === 0) {
    console.log("No expenses to export")
    return
  }

  const csvHeader = "ID,Date,Description,Amount,Category\n"
  const csvRows = expenses
    .map((expense) => `${expense.id},${expense.date},"${expense.description}",${expense.amount},${expense.category}`)
    .join("\n")

  const csvContent = csvHeader + csvRows

  fs.writeFileSync(filename, csvContent)
  console.log(`Expenses exported to ${filename}`)
}

// Utility function to get argument values
function getArgValue(args, flag) {
  const index = args.indexOf(flag)
  return index !== -1 && index + 1 < args.length ? args[index + 1] : null
}

// Main function
function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log(`
Expense Tracker - Manage your finances from the command line

Usage:
  expense-tracker <command> [options]

Commands:
  add       Add a new expense
  update    Update an existing expense
  delete    Delete an expense
  list      List all expenses
  summary   Show expense summary
  budget    Set monthly budget
  export    Export expenses to CSV

Examples:
  expense-tracker add --description "Lunch" --amount 20 --category "Food"
  expense-tracker list --category "Food"
  expense-tracker summary --month 8
  expense-tracker update --id 1 --description "Business Lunch" --amount 25
  expense-tracker delete --id 2
  expense-tracker budget --month 8 --amount 1000
  expense-tracker export --file "august-expenses.csv"
    `)
    return
  }

  const command = args[0]

  try {
    switch (command) {
      case "add":
        addExpense(args)
        break
      case "update":
        updateExpense(args)
        break
      case "delete":
        deleteExpense(args)
        break
      case "list":
        listExpenses(args)
        break
      case "summary":
        showSummary(args)
        break
      case "budget":
        setBudget(args)
        break
      case "export":
        exportToCsv(args)
        break
      default:
        console.error(`Unknown command: ${command}`)
        console.log('Run "expense-tracker" without arguments to see usage information.')
        process.exit(1)
    }
  } catch (error) {
    console.error("Error:", error.message)
    process.exit(1)
  }
}

// Run the application
main()

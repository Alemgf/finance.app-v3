// Types for bank accounts with credit card support
export interface BankAccount {
  id: string
  name: string
  type: "debit" | "credit" | "both"
  debitBalance?: number
  creditLimit?: number
  creditUsed?: number
  billingDay?: number
  paymentDay?: number
  icon?: string
}

// Default bank accounts for demonstration (zerados conforme solicitado)
export const defaultBankAccounts: BankAccount[] = [
  {
    id: "nubank-pj",
    name: "Nubank PJ",
    type: "both",
    debitBalance: 0,
    creditLimit: 0,
    creditUsed: 0,
    billingDay: 26,
    paymentDay: 5,
    icon: "💳",
  },
  {
    id: "nubank-personal",
    name: "Nubank Pessoal",
    type: "both",
    debitBalance: 0,
    creditLimit: 0,
    creditUsed: 0,
    billingDay: 26,
    paymentDay: 5,
    icon: "💳",
  },
]

// Helper functions for bank accounts
export function calculateAvailableCredit(account: BankAccount): number {
  if (account.type === "debit") return 0
  if (!account.creditLimit) return 0

  // Se creditUsed não estiver definido, considere como 0
  const usedCredit = account.creditUsed || 0

  return Math.max(0, account.creditLimit - usedCredit)
}

export function calculateTotalAvailable(accounts: BankAccount[]): {
  totalDebit: number
  totalCredit: number
  totalAvailable: number
} {
  let totalDebit = 0
  let totalCredit = 0

  accounts.forEach((account) => {
    // Add debit balance
    if (account.type === "debit" || account.type === "both") {
      totalDebit += account.debitBalance || 0
    }

    // Add available credit (limite - utilizado)
    if (account.type === "credit" || account.type === "both") {
      totalCredit += calculateAvailableCredit(account)
    }
  })

  return {
    totalDebit,
    totalCredit,
    totalAvailable: totalDebit + totalCredit,
  }
}

// Calculate days until billing cycle closes
export function getDaysUntilBilling(account: BankAccount): number {
  if (!account.billingDay) return 0

  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // If billing day has passed this month, calculate for next month
  if (currentDay > account.billingDay) {
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear
    const billingDate = new Date(nextYear, nextMonth, account.billingDay)

    return Math.ceil((billingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  } else {
    // Billing day is still coming this month
    const billingDate = new Date(currentYear, currentMonth, account.billingDay)

    return Math.ceil((billingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }
}

// Get current billing cycle period as string
export function getBillingCyclePeriod(account: BankAccount): string {
  if (!account.billingDay) return "N/A"

  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  // Format date as DD/MM
  const formatDate = (date: Date) => {
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`
  }

  // If we're past the billing day, the cycle is from this month's billing day to next month's billing day
  if (currentDay >= account.billingDay) {
    const cycleStart = new Date(currentYear, currentMonth, account.billingDay)
    const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1
    const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear
    const cycleEnd = new Date(nextYear, nextMonth, account.billingDay - 1)

    return `${formatDate(cycleStart)} - ${formatDate(cycleEnd)}`
  } else {
    // We're before the billing day, so the cycle is from previous month's billing day to this month's billing day
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear
    const cycleStart = new Date(prevYear, prevMonth, account.billingDay)
    const cycleEnd = new Date(currentYear, currentMonth, account.billingDay - 1)

    return `${formatDate(cycleStart)} - ${formatDate(cycleEnd)}`
  }
}

// Get days in current month
export function getDaysInCurrentMonth(): number {
  const date = new Date()
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

// Get remaining days in current month
export function getRemainingDaysInMonth(): number {
  const today = new Date()
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return lastDayOfMonth.getDate() - today.getDate() + 1 // +1 para incluir o dia atual
}

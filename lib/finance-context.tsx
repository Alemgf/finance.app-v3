"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import { supabase } from "./supabase-client"
import {
  type Expense,
  type Goal,
  getUserExpenses,
  getUserGoals,
  getUserCategories,
  addUserCategory,
  removeUserCategory,
} from "./database"

// Interfaces and types
export interface FinanceEntry {
  id: string
  description: string
  amount: number
  date: Date
  categories: string[]
  isPaid: boolean
  isFixed: boolean
  location: string
  type: string
  paymentType: string
  isValidated: boolean
  bank: string
  bankAccountId: string
}

export interface BankAccount {
  id: string
  name: string
  type: string
  debitBalance: number
  creditLimit: number
  creditUsed: number
  billingDay: number
  paymentDay: number
  icon: string
}

export interface Subcategory {
  label: string
  value: string
}

interface FinanceContextType {
  entries: FinanceEntry[]
  goals: Goal[]
  bankAccounts: BankAccount[]
  subcategories: Record<string, Subcategory[]>
  isLoading: boolean
  addEntry: (entry: Omit<FinanceEntry, "id">) => Promise<FinanceEntry>
  updateEntry: (id: string, updates: Partial<FinanceEntry>) => Promise<void>
  removeEntry: (id: string) => Promise<void>
  toggleEntryValidation: (id: string) => Promise<void>
  addBankAccount: (account: Omit<BankAccount, "id">) => Promise<BankAccount>
  updateBankAccount: (id: string, updates: Partial<BankAccount>) => Promise<void>
  removeBankAccount: (id: string) => Promise<void>
  addSubcategory: (type: string, subcategory: Subcategory) => Promise<void>
  removeSubcategory: (type: string, value: string) => Promise<void>
  getEntriesByType: (type: string) => FinanceEntry[]
  getTotalByType: (type: string, paymentType?: string) => number
  getTodayTotal: () => number
  getWeekTotal: () => number
  getMonthTotal: () => number
  calculateDailyExcess: () => number
  getBankBasedBudget: () => { daily: number; weekly: number; monthly: number }
  getBankTotals: () => { [bank: string]: { debito: number; credito: number } }
  getSubcategories: (type: string) => Subcategory[]
  syncEntriesToLiquido: () => Promise<void>
  getNetAmount: () => { debito: number; credito: number }
  getAvailableFunds: () => { totalDebit: number; totalCredit: number; totalAvailable: number }
  getAllocatedFunds: () => { debit: number; credit: number }
  setAllocatedFunds: (debit: number, credit: number) => void
  getAdjustedDailyBudget: () => number
  getWeeklyBudget: () => number
  getMonthlyBudget: () => number
  getExcessAmount: () => number
  setSpendingAllocation: (allocation: { debito: number; credito: number }) => void
  getSpendingAllocation: () => { debito: number; credito: number }
  getBankAccountById: (id: string) => BankAccount | undefined
}

const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<FinanceEntry[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [subcategories, setSubcategories] = useState<Record<string, Subcategory[]>>({
    ganhos: [],
    "custo-fixo": [],
    "custo-variado": [],
    parcela: [],
    gastos: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [spendingAllocation, setSpendingAllocation] = useState({ debito: 50, credito: 50 })
  const [allocatedFunds, setAllocatedFundsState] = useState({ debit: 0, credit: 0 })

  const setAllocatedFunds = (debit: number, credit: number) => {
    setAllocatedFundsState({ debit, credit })
  }

  useEffect(() => {
    const savedAllocation = localStorage.getItem("spendingAllocation")
    if (savedAllocation) {
      setSpendingAllocation(JSON.parse(savedAllocation))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("spendingAllocation", JSON.stringify(spendingAllocation))
  }, [spendingAllocation])

  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      setIsLoading(false)
      return
    }

    const loadData = async () => {
      setIsLoading(true)
      try {
        const expenses = await getUserExpenses(user.id)
        setEntries(expenses.map(convertDbExpenseToAppExpense))

        const userGoals = await getUserGoals(user.id)
        setGoals(userGoals)

        const { data: bankAccountsData } = await supabase.from("bank_accounts").select("*").eq("user_id", user.id)

        setBankAccounts(bankAccountsData?.map(mapDbAccountToAccount) || [])

        const types = ["ganhos", "custo-fixo", "custo-variado", "parcela", "gastos"]
        const subcatsObj: Record<string, Subcategory[]> = {}

        for (const type of types) {
          const subcats = await getUserCategories(user.id, type)
          subcatsObj[type] = subcats
        }

        setSubcategories(subcatsObj)
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  useEffect(() => {
    if (!user) return

    const subscription = supabase
      .channel("finance-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "expenses",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newExpense = convertDbExpenseToAppExpense(payload.new)
            setEntries((prev) => [...prev, newExpense])
          } else if (payload.eventType === "UPDATE") {
            const updatedExpense = convertDbExpenseToAppExpense(payload.new)
            setEntries((prev) => prev.map((entry) => (entry.id === updatedExpense.id ? updatedExpense : entry)))
          } else if (payload.eventType === "DELETE") {
            setEntries((prev) => prev.filter((entry) => entry.id !== payload.old.id))
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "goals",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newGoal = convertDbGoalToAppGoal(payload.new)
            setGoals((prev) => [...prev, newGoal])
          } else if (payload.eventType === "UPDATE") {
            const updatedGoal = convertDbGoalToAppGoal(payload.new)
            setGoals((prev) => prev.map((goal) => (goal.id === updatedGoal.id ? updatedGoal : goal)))
          } else if (payload.eventType === "DELETE") {
            setGoals((prev) => prev.filter((goal) => goal.id !== payload.old.id))
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bank_accounts",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newAccount = mapDbAccountToAccount(payload.new)
            setBankAccounts((prev) => [...prev, newAccount])
          } else if (payload.eventType === "UPDATE") {
            const updatedAccount = mapDbAccountToAccount(payload.new)
            setBankAccounts((prev) =>
              prev.map((account) => (account.id === updatedAccount.id ? updatedAccount : account)),
            )
          } else if (payload.eventType === "DELETE") {
            setBankAccounts((prev) => prev.filter((account) => account.id !== payload.old.id))
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
          filter: `user_id=eq.${user.id}`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const { type, label, value } = payload.new
            setSubcategories((prev) => ({
              ...prev,
              [type]: [...(prev[type] || []), { label, value }],
            }))
          } else if (payload.eventType === "DELETE") {
            const { type, value } = payload.old
            setSubcategories((prev) => ({
              ...prev,
              [type]: (prev[type] || []).filter((subcat) => subcat.value !== value),
            }))
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user])

  const addEntry = async (entry: Omit<FinanceEntry, "id">): Promise<FinanceEntry> => {
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        user_id: user.id,
        goal_id: entry.bankAccountId,
        date: entry.date.toISOString(),
        description: entry.description,
        amount: entry.amount,
        location: entry.location,
        is_paid: entry.isPaid,
        is_fixed: entry.isFixed,
        payment_type: entry.paymentType,
        is_validated: entry.isValidated,
        categories: entry.categories,
        bank: entry.bank,
        type: entry.type,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return convertDbExpenseToAppExpense(data)
  }

  const updateEntry = async (id: string, updates: Partial<FinanceEntry>): Promise<void> => {
    if (!user) throw new Error("User not authenticated")

    const updatesToApply: any = {}

    if (updates.description) updatesToApply.description = updates.description
    if (updates.amount) updatesToApply.amount = updates.amount
    if (updates.date) updatesToApply.date = updates.date.toISOString()
    if (updates.categories) updatesToApply.categories = updates.categories
    if (updates.isPaid) updatesToApply.is_paid = updates.isPaid
    if (updates.isFixed) updatesToApply.is_fixed = updates.isFixed
    if (updates.location) updatesToApply.location = updates.location
    if (updates.type) updatesToApply.type = updates.type
    if (updates.paymentType) updatesToApply.payment_type = updates.paymentType
    if (updates.isValidated) updatesToApply.is_validated = updates.isValidated
    if (updates.bank) updatesToApply.bank = updates.bank
    if (updates.bankAccountId) updatesToApply.goal_id = updates.bankAccountId

    const { error } = await supabase.from("expenses").update(updatesToApply).eq("id", id)

    if (error) throw error
  }

  const removeEntry = async (id: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated")

    const { error } = await supabase.from("expenses").delete().eq("id", id)

    if (error) throw error
  }

  const toggleEntryValidation = async (id: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated")

    const entry = entries.find((e) => e.id === id)
    if (!entry) return

    await updateEntry(id, { isValidated: !entry.isValidated })
  }

  const addBankAccount = async (account: Omit<BankAccount, "id">): Promise<BankAccount> => {
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("bank_accounts")
      .insert({
        user_id: user.id,
        name: account.name,
        type: account.type,
        debit_balance: account.debitBalance,
        credit_limit: account.creditLimit,
        credit_used: account.creditUsed,
        created_at: new Date().toISOString(),
        icon: account.icon,
      })
      .select()
      .single()

    if (error) throw error

    return mapDbAccountToAccount(data)
  }

  const updateBankAccount = async (id: string, updates: Partial<BankAccount>): Promise<void> => {
    if (!user) throw new Error("User not authenticated")

    const updatesToApply: any = {}

    if (updates.name) updatesToApply.name = updates.name
    if (updates.type) updatesToApply.type = updates.type
    if (updates.debitBalance) updatesToApply.debit_balance = updates.debitBalance
    if (updates.creditLimit) updatesToApply.credit_limit = updates.creditLimit
    if (updates.creditUsed) updatesToApply.credit_used = updates.creditUsed
    if (updates.icon) updatesToApply.icon = updates.icon

    const { error } = await supabase.from("bank_accounts").update(updatesToApply).eq("id", id)

    if (error) throw error
  }

  const removeBankAccount = async (id: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated")

    const { error } = await supabase.from("bank_accounts").delete().eq("id", id)

    if (error) throw error
  }

  const addSubcategory = async (type: string, subcategory: Subcategory): Promise<void> => {
    if (!user) throw new Error("User not authenticated")
    await addUserCategory(user.id, type, subcategory.label, subcategory.value)
  }

  const removeSubcategory = async (type: string, value: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated")
    await removeUserCategory(user.id, type, value)
  }

  const getEntriesByType = (type: string): FinanceEntry[] => {
    return entries.filter((entry) => entry.type === type)
  }

  const getTotalByType = (type: string, paymentType?: string): number => {
    let filteredEntries = entries.filter((entry) => entry.type === type && entry.isValidated)
    if (paymentType) {
      filteredEntries = filteredEntries.filter((entry) => entry.paymentType === paymentType)
    }
    return filteredEntries.reduce((sum, entry) => sum + entry.amount, 0)
  }

  const getTodayTotal = (): number => {
    const today = new Date()
    return entries
      .filter((entry) => {
        const entryDate = new Date(entry.date)
        return (
          entryDate.getDate() === today.getDate() &&
          entryDate.getMonth() === today.getMonth() &&
          entryDate.getFullYear() === today.getFullYear() &&
          entry.isValidated
        )
      })
      .reduce((sum, entry) => sum + entry.amount, 0)
  }

  const getWeekTotal = (): number => {
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6))

    return entries
      .filter((entry) => {
        const entryDate = new Date(entry.date)
        return entryDate >= startOfWeek && entryDate <= endOfWeek && entry.isValidated
      })
      .reduce((sum, entry) => sum + entry.amount, 0)
  }

  const getMonthTotal = (): number => {
    const today = new Date()
    return entries
      .filter((entry) => {
        const entryDate = new Date(entry.date)
        return (
          entryDate.getMonth() === today.getMonth() &&
          entryDate.getFullYear() === today.getFullYear() &&
          entry.isValidated
        )
      })
      .reduce((sum, entry) => sum + entry.amount, 0)
  }

  const calculateDailyExcess = (): number => {
    return 0
  }

  const getBankBasedBudget = (): { daily: number; weekly: number; monthly: number } => {
    return { daily: 0, weekly: 0, monthly: 0 }
  }

  const getBankTotals = (): { [bank: string]: { debito: number; credito: number } } => {
    const totals: { [bank: string]: { debito: number; credito: number } } = {}

    entries.forEach((entry) => {
      if (!entry.isValidated) return

      const bank = entry.bank || "default"

      if (!totals[bank]) {
        totals[bank] = { debito: 0, credito: 0 }
      }

      if (entry.paymentType === "debito") {
        totals[bank].debito += entry.amount
      } else if (entry.paymentType === "credito") {
        totals[bank].credito += entry.amount
      }
    })

    return totals
  }

  const getSubcategories = (type: string): Subcategory[] => {
    return subcategories[type] || []
  }

  const syncEntriesToLiquido = async (): Promise<void> => {
    // Implement your logic here
  }

  const getNetAmount = (): { debito: number; credito: number } => {
    let debito = 0
    let credito = 0

    bankAccounts.forEach((account) => {
      if (account.type === "debit" || account.type === "both") {
        debito += account.debitBalance || 0
      }
      if (account.type === "credit" || account.type === "both") {
        credito += (account.creditLimit || 0) - (account.creditUsed || 0)
      }
    })

    return { debito, credito }
  }

  const getAvailableFunds = (): { totalDebit: number; totalCredit: number; totalAvailable: number } => {
    let totalDebit = 0
    let totalCredit = 0

    bankAccounts.forEach((account) => {
      if (account.type === "debit" || account.type === "both") {
        totalDebit += account.debitBalance || 0
      }
      if (account.type === "credit" || account.type === "both") {
        totalCredit += (account.creditLimit || 0) - (account.creditUsed || 0)
      }
    })

    const totalAvailable = totalDebit + totalCredit

    return { totalDebit, totalCredit, totalAvailable }
  }

  const getAllocatedFunds = (): { debit: number; credit: number } => {
    return allocatedFunds
  }

  const updateSpendingAllocation = (allocation: { debito: number; credito: number }) => {
    setSpendingAllocation(allocation)
  }

  const getSpendingAllocation = (): { debito: number; credito: number } => {
    return spendingAllocation
  }

  const getAdjustedDailyBudget = (): number => {
    return 0
  }

  const getWeeklyBudget = (): number => {
    return 0
  }

  const getMonthlyBudget = (): number => {
    return 0
  }

  const getExcessAmount = (): number => {
    return 0
  }

  const getBankAccountById = (id: string): BankAccount | undefined => {
    return bankAccounts.find((account) => account.id === id)
  }

  return (
    <FinanceContext.Provider
      value={{
        entries,
        goals,
        bankAccounts,
        subcategories,
        isLoading,
        addEntry,
        updateEntry,
        removeEntry,
        toggleEntryValidation,
        addBankAccount,
        updateBankAccount,
        removeBankAccount,
        addSubcategory,
        removeSubcategory,
        getEntriesByType,
        getTotalByType,
        getTodayTotal,
        getWeekTotal,
        getMonthTotal,
        calculateDailyExcess,
        getBankBasedBudget,
        getBankTotals,
        getSubcategories,
        syncEntriesToLiquido,
        getNetAmount,
        getAvailableFunds,
        getAllocatedFunds,
        setAllocatedFunds,
        getAdjustedDailyBudget,
        getWeeklyBudget,
        getMonthlyBudget,
        getExcessAmount,
        setSpendingAllocation: updateSpendingAllocation,
        getSpendingAllocation,
        getBankAccountById,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}

function convertDbExpenseToAppExpense(dbExpense: any): Expense {
  return {
    id: dbExpense.id,
    userId: dbExpense.user_id,
    goalId: dbExpense.goal_id,
    date: new Date(dbExpense.date),
    description: dbExpense.description,
    amount: dbExpense.amount,
    location: dbExpense.location,
    isPaid: dbExpense.is_paid,
    isFixed: dbExpense.is_fixed,
    paymentType: dbExpense.payment_type,
    isValidated: dbExpense.is_validated,
    categories: dbExpense.categories || [],
    bank: dbExpense.bank,
    type: dbExpense.type,
  }
}

function convertDbGoalToAppGoal(dbGoal: any): Goal {
  return {
    id: dbGoal.id,
    userId: dbGoal.user_id,
    name: dbGoal.name,
    targetAmount: dbGoal.target_amount,
    savedAmount: dbGoal.saved_amount,
    startDate: new Date(dbGoal.start_date),
    endDate: new Date(dbGoal.end_date),
    dailyBudget: dbGoal.daily_budget,
  }
}

function mapDbAccountToAccount(dbAccount: any): BankAccount {
  return {
    id: dbAccount.id,
    name: dbAccount.name,
    type: dbAccount.type,
    debitBalance: dbAccount.debit_balance || 0,
    creditLimit: dbAccount.credit_limit || 0,
    creditUsed: dbAccount.credit_used || 0,
    billingDay: dbAccount.billingDay || 1,
    paymentDay: dbAccount.paymentDay || 10,
    icon: dbAccount.icon || "💳",
  }
}

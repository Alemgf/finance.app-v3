"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Tipos
export interface Expense {
  id: string
  description: string
  amount: number
  date: Date
  categories: string[] // Múltiplas categorias
  isPaid: boolean // Pago/não pago
  isFixed: boolean // Fixo/variado
  location: string // O que ou Aonde?
}

interface ExpenseContextType {
  expenses: Expense[]
  addExpense: (expense: Omit<Expense, "id">) => void
  getTodayTotal: () => number
  getWeekTotal: () => number
  getMonthTotal: () => number
  getExpensesByDate: (date: Date) => Expense[]
}

// Contexto
const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined)

// Mock de dados iniciais
const initialExpenses: Expense[] = [
  {
    id: "1",
    description: "Supermercado",
    amount: 80,
    date: new Date(2023, 5, 15),
    categories: ["Alimentação", "Casa"],
    isPaid: true,
    isFixed: false,
    location: "Supermercado Bom Preço",
  },
  {
    id: "2",
    description: "Café",
    amount: 15,
    date: new Date(2023, 5, 15),
    categories: ["Alimentação", "Lazer"],
    isPaid: true,
    isFixed: false,
    location: "Cafeteria do Centro",
  },
  {
    id: "3",
    description: "Aluguel",
    amount: 1200,
    date: new Date(2023, 5, 14),
    categories: ["Moradia"],
    isPaid: true,
    isFixed: true,
    location: "Apartamento",
  },
]

// Provider
export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses)

  // Em uma aplicação real, carregaríamos os gastos do banco de dados aqui
  useEffect(() => {
    // Simular carregamento de dados
    const savedExpenses = localStorage.getItem("expenses")
    if (savedExpenses) {
      try {
        // Precisamos converter as strings de data de volta para objetos Date
        const parsedExpenses = JSON.parse(savedExpenses, (key, value) => {
          if (key === "date") return new Date(value)
          return value
        })
        setExpenses(parsedExpenses)
      } catch (error) {
        console.error("Erro ao carregar gastos:", error)
      }
    }
  }, [])

  // Salvar gastos no localStorage quando mudam
  useEffect(() => {
    localStorage.setItem("expenses", JSON.stringify(expenses))
  }, [expenses])

  // Adicionar um novo gasto
  const addExpense = (expense: Omit<Expense, "id">) => {
    const newExpense = {
      ...expense,
      id: Math.random().toString(36).substring(2, 9),
    }
    setExpenses((prev) => [...prev, newExpense])
  }

  // Obter o total gasto hoje
  const getTodayTotal = () => {
    const today = new Date()
    return expenses
      .filter(
        (expense) =>
          expense.date.getDate() === today.getDate() &&
          expense.date.getMonth() === today.getMonth() &&
          expense.date.getFullYear() === today.getFullYear(),
      )
      .reduce((total, expense) => total + expense.amount, 0)
  }

  // Obter o total gasto na semana
  const getWeekTotal = () => {
    const today = new Date()
    const weekAgo = new Date(today)
    weekAgo.setDate(today.getDate() - 7)

    return expenses
      .filter((expense) => expense.date >= weekAgo && expense.date <= today)
      .reduce((total, expense) => total + expense.amount, 0)
  }

  // Obter o total gasto no mês
  const getMonthTotal = () => {
    const today = new Date()
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

    return expenses
      .filter((expense) => expense.date >= firstDayOfMonth && expense.date <= today)
      .reduce((total, expense) => total + expense.amount, 0)
  }

  // Obter gastos por data
  const getExpensesByDate = (date: Date) => {
    return expenses.filter(
      (expense) =>
        expense.date.getDate() === date.getDate() &&
        expense.date.getMonth() === date.getMonth() &&
        expense.date.getFullYear() === date.getFullYear(),
    )
  }

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        addExpense,
        getTodayTotal,
        getWeekTotal,
        getMonthTotal,
        getExpensesByDate,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  )
}

// Hook para usar o contexto
export function useExpenses() {
  const context = useContext(ExpenseContext)
  if (context === undefined) {
    throw new Error("useExpenses must be used within an ExpenseProvider")
  }
  return context
}

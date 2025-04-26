"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { type BankAccount, defaultBankAccounts, calculateTotalAvailable } from "./bank-account-model"

// Tipos
export interface FinanceEntry {
  id: string
  description: string
  amount: number
  date: Date
  categories: string[]
  isPaid: boolean
  isFixed: boolean
  location: string
  type: "ganhos" | "custo-fixo" | "custo-variado" | "parcela" | "gastos"
  paymentType: "debito" | "credito"
  bank?: string
  isValidated: boolean
  bankAccountId?: string // New field to link to a specific bank account
}

interface SubcategoryOption {
  label: string
  value: string
}

interface CategorySubcategories {
  ganhos: SubcategoryOption[]
  "custo-fixo": SubcategoryOption[]
  "custo-variado": SubcategoryOption[]
  parcela: SubcategoryOption[]
  gastos: SubcategoryOption[]
}

interface BankTotals {
  [key: string]: {
    debito: number
    credito: number
  }
}

interface DailyBudgetInfo {
  originalBudget: number
  adjustedBudget: number
  excess: number
  date: string
}

interface FinanceContextType {
  entries: FinanceEntry[]
  addEntry: (entry: Omit<FinanceEntry, "id">) => void
  removeEntry: (id: string) => void
  updateEntry: (id: string, updates: Partial<Omit<FinanceEntry, "id">>) => void
  getEntriesByType: (type: FinanceEntry["type"]) => FinanceEntry[]
  getTotalByType: (type: FinanceEntry["type"], paymentType?: "debito" | "credito") => number
  getNetAmount: () => { debito: number; credito: number }
  getSpendingAllocation: () => { debito: number; credito: number }
  setSpendingAllocation: (allocation: { debito: number; credito: number }) => void
  getDailyBudget: () => number
  getAdjustedDailyBudget: () => number
  getExcessAmount: () => number
  getWeeklyBudget: () => number
  getMonthlyBudget: () => number
  getTodayTotal: () => number
  getWeekTotal: () => number
  getMonthTotal: () => number
  getSubcategories: (type: FinanceEntry["type"]) => SubcategoryOption[]
  addSubcategory: (type: FinanceEntry["type"], subcategory: SubcategoryOption) => void
  removeSubcategory: (type: FinanceEntry["type"], value: string) => void
  getBanks: () => SubcategoryOption[]
  addBank: (bank: SubcategoryOption) => void
  removeBank: (value: string) => void
  getBankTotals: () => BankTotals
  toggleEntryValidation: (id: string) => void
  processMonthlyFixedEntries: () => void
  calculateDailyExcess: () => void
  // New bank account methods
  bankAccounts: BankAccount[]
  addBankAccount: (account: Omit<BankAccount, "id">) => void
  updateBankAccount: (id: string, updates: Partial<BankAccount>) => void
  removeBankAccount: (id: string) => void
  getBankAccountById: (id: string) => BankAccount | undefined
  getAvailableFunds: () => { totalDebit: number; totalCredit: number; totalAvailable: number }
  recalculateAllBankAccountBalances: () => void
  // Métodos para orçamento baseado em contas bancárias
  getBankBasedBudget: () => { daily: number; weekly: number; monthly: number }
  getAllocatedFunds: () => { debit: number; credit: number; total: number }
  setAllocatedFunds: (debit: number, credit: number) => void
  syncEntriesToLiquido: () => void
}

// Contexto
const FinanceContext = createContext<FinanceContextType | undefined>(undefined)

// Subcategorias iniciais
const initialSubcategories: CategorySubcategories = {
  ganhos: [
    { label: "Salário", value: "salario" },
    { label: "Freelance", value: "freelance" },
    { label: "Investimentos", value: "investimentos" },
    { label: "Saldo em Conta", value: "saldo-conta" },
    { label: "Crédito Disponível", value: "credito-disponivel" },
  ],
  "custo-fixo": [
    { label: "Aluguel", value: "aluguel" },
    { label: "Contas", value: "contas" },
    { label: "Assinaturas", value: "assinaturas" },
  ],
  "custo-variado": [
    { label: "Alimentação", value: "alimentacao" },
    { label: "Transporte", value: "transporte" },
    { label: "Lazer", value: "lazer" },
  ],
  parcela: [
    { label: "Eletrônicos", value: "eletronicos" },
    { label: "Vestuário", value: "vestuario" },
    { label: "Veículos", value: "veiculos" },
  ],
  gastos: [
    { label: "Alimentação", value: "alimentacao" },
    { label: "Transporte", value: "transporte" },
    { label: "Lazer", value: "lazer" },
    { label: "Compras", value: "compras" },
  ],
}

// Bancos iniciais
const initialBanks: SubcategoryOption[] = [{ label: "Nubank", value: "nubank" }]

// Mock de dados iniciais (zerados conforme solicitado)
const initialEntries: FinanceEntry[] = []

// Provider
export function FinanceProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<FinanceEntry[]>(initialEntries)
  const [spendingAllocation, setSpendingAllocation] = useState({ debito: 70, credito: 30 })
  const [subcategories, setSubcategories] = useState<CategorySubcategories>(initialSubcategories)
  const [banks, setBanks] = useState<SubcategoryOption[]>(initialBanks)
  const [lastProcessedMonth, setLastProcessedMonth] = useState<string>("")
  const [dailyBudgetInfo, setDailyBudgetInfo] = useState<DailyBudgetInfo>({
    originalBudget: 0,
    adjustedBudget: 0,
    excess: 0,
    date: new Date().toISOString().split("T")[0],
  })
  const [lastExcessCalculationDate, setLastExcessCalculationDate] = useState<string>("")
  // New state for bank accounts
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(defaultBankAccounts)
  // State for allocated funds
  const [allocatedDebit, setAllocatedDebit] = useState(0)
  const [allocatedCredit, setAllocatedCredit] = useState(0)

  // Em uma aplicação real, carregaríamos os dados do banco de dados aqui
  useEffect(() => {
    // Simular carregamento de dados
    const savedEntries = localStorage.getItem("financeEntries")
    const savedAllocation = localStorage.getItem("spendingAllocation")
    const savedSubcategories = localStorage.getItem("subcategories")
    const savedBanks = localStorage.getItem("banks")
    const savedLastProcessedMonth = localStorage.getItem("lastProcessedMonth")
    const savedDailyBudgetInfo = localStorage.getItem("dailyBudgetInfo")
    const savedLastExcessCalculationDate = localStorage.getItem("lastExcessCalculationDate")
    const savedBankAccounts = localStorage.getItem("bankAccounts")
    const savedAllocatedFunds = localStorage.getItem("allocatedFunds")

    if (savedEntries) {
      try {
        // Precisamos converter as strings de data de volta para objetos Date
        const parsedEntries = JSON.parse(savedEntries, (key, value) => {
          if (key === "date") return new Date(value)
          return value
        })
        setEntries(parsedEntries)
      } catch (error) {
        console.error("Erro ao carregar entradas financeiras:", error)
      }
    }

    if (savedAllocation) {
      try {
        setSpendingAllocation(JSON.parse(savedAllocation))
      } catch (error) {
        console.error("Erro ao carregar alocação de gastos:", error)
      }
    }

    if (savedSubcategories) {
      try {
        setSubcategories(JSON.parse(savedSubcategories))
      } catch (error) {
        console.error("Erro ao carregar subcategorias:", error)
      }
    }

    if (savedBanks) {
      try {
        setBanks(JSON.parse(savedBanks))
      } catch (error) {
        console.error("Erro ao carregar bancos:", error)
      }
    }

    if (savedLastProcessedMonth) {
      setLastProcessedMonth(savedLastProcessedMonth)
    }

    if (savedDailyBudgetInfo) {
      try {
        setDailyBudgetInfo(JSON.parse(savedDailyBudgetInfo))
      } catch (error) {
        console.error("Erro ao carregar informações de orçamento diário:", error)
      }
    }

    if (savedLastExcessCalculationDate) {
      setLastExcessCalculationDate(savedLastExcessCalculationDate)
    }

    if (savedBankAccounts) {
      try {
        setBankAccounts(JSON.parse(savedBankAccounts))
      } catch (error) {
        console.error("Erro ao carregar contas bancárias:", error)
        // Fall back to default accounts if there's an error
        setBankAccounts(defaultBankAccounts)
      }
    }

    if (savedAllocatedFunds) {
      try {
        const { debit, credit } = JSON.parse(savedAllocatedFunds)
        setAllocatedDebit(debit)
        setAllocatedCredit(credit)
      } catch (error) {
        console.error("Erro ao carregar fundos alocados:", error)
      }
    }
  }, [])

  // Salvar dados no localStorage quando mudam
  useEffect(() => {
    localStorage.setItem("financeEntries", JSON.stringify(entries))
  }, [entries])

  useEffect(() => {
    localStorage.setItem("spendingAllocation", JSON.stringify(spendingAllocation))
  }, [spendingAllocation])

  useEffect(() => {
    localStorage.setItem("subcategories", JSON.stringify(subcategories))
  }, [subcategories])

  useEffect(() => {
    localStorage.setItem("banks", JSON.stringify(banks))
  }, [banks])

  useEffect(() => {
    localStorage.setItem("lastProcessedMonth", lastProcessedMonth)
  }, [lastProcessedMonth])

  useEffect(() => {
    localStorage.setItem("dailyBudgetInfo", JSON.stringify(dailyBudgetInfo))
  }, [dailyBudgetInfo])

  useEffect(() => {
    localStorage.setItem("lastExcessCalculationDate", lastExcessCalculationDate)
  }, [lastExcessCalculationDate])

  useEffect(() => {
    localStorage.setItem("bankAccounts", JSON.stringify(bankAccounts))
  }, [bankAccounts])

  useEffect(() => {
    localStorage.setItem("allocatedFunds", JSON.stringify({ debit: allocatedDebit, credit: allocatedCredit }))
  }, [allocatedDebit, allocatedCredit])

  // Verificar e processar entradas fixas mensais
  useEffect(() => {
    const currentMonth = new Date().toISOString().substring(0, 7) // YYYY-MM

    if (currentMonth !== lastProcessedMonth) {
      processMonthlyFixedEntries()
      setLastProcessedMonth(currentMonth)
    }
  }, [lastProcessedMonth])

  // Verificar e calcular excesso diário
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0]

    // Se a data atual for diferente da última data de cálculo de excesso
    // e diferente da data do orçamento atual, calcular o excesso
    if (today !== lastExcessCalculationDate && today !== dailyBudgetInfo.date) {
      // Usar uma função que não depende de estado para calcular o excesso
      const calculateExcess = () => {
        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        const yesterdayString = yesterday.toISOString().split("T")[0]

        // Obter gastos de ontem
        let yesterdayTotal = 0
        entries.forEach((entry) => {
          const entryDateString = entry.date.toISOString().split("T")[0]
          if (entryDateString === yesterdayString && entry.type === "gastos" && entry.isValidated) {
            yesterdayTotal += entry.amount
          }
        })

        // Calcular excesso (se gasto de ontem > orçamento ajustado de ontem)
        const originalBudget = dailyBudgetInfo.originalBudget
        const yesterdayBudget = dailyBudgetInfo.adjustedBudget

        // Se o usuário gastou exatamente o valor ajustado, resetar o excesso
        if (Math.abs(yesterdayTotal - yesterdayBudget) < 0.01) {
          setDailyBudgetInfo({
            originalBudget: originalBudget,
            adjustedBudget: originalBudget,
            excess: 0,
            date: today,
          })
          return
        }

        // Se o usuário gastou mais que o valor ajustado, calcular novo excesso
        const newExcess = Math.max(0, yesterdayTotal - yesterdayBudget)
        const totalExcess = dailyBudgetInfo.excess + newExcess

        // Ajustar orçamento para hoje
        const todayAdjustedBudget = originalBudget - totalExcess

        setDailyBudgetInfo({
          originalBudget: originalBudget,
          adjustedBudget: todayAdjustedBudget,
          excess: totalExcess,
          date: today,
        })
      }

      calculateExcess()
      setLastExcessCalculationDate(today)
    }
  }, [entries, lastExcessCalculationDate, dailyBudgetInfo.date])

  // Função para atualizar o saldo da conta bancária com base em uma entrada
  const updateBankAccountFromEntry = (entry: FinanceEntry) => {
    if (!entry.bankAccountId) return

    const account = getBankAccountById(entry.bankAccountId)
    if (!account) return

    // Atualizar o saldo da conta bancária com base no tipo de entrada
    if (entry.type === "ganhos") {
      if (entry.paymentType === "debito") {
        // Se for um ganho em débito, atualizar o saldo em débito da conta
        updateBankAccount(account.id, {
          debitBalance: (account.debitBalance || 0) + entry.amount,
        })
      } else if (entry.paymentType === "credito") {
        // Se for um ganho em crédito, atualizar o limite de crédito da conta
        updateBankAccount(account.id, {
          creditLimit: (account.creditLimit || 0) + entry.amount,
        })
      }
    } else if (entry.type === "custo-variado" && entry.paymentType === "credito") {
      // Se for um custo variado em crédito, atualizar o crédito utilizado da conta
      updateBankAccount(account.id, {
        creditUsed: (account.creditUsed || 0) + entry.amount,
      })
    }
  }

  // Adicionar uma nova entrada
  const addEntry = (entry: Omit<FinanceEntry, "id">) => {
    // Garantir que a data seja um objeto Date válido
    const entryDate = entry.date instanceof Date ? entry.date : new Date(entry.date)

    // Verificar se é um ganho associado a uma conta bancária
    if (entry.type === "ganhos" && entry.bankAccountId) {
      // Obter a conta bancária associada
      const bankAccount = getBankAccountById(entry.bankAccountId)

      // Se a conta existe, atualizar o saldo da conta em vez de apenas adicionar uma nova entrada
      if (bankAccount) {
        // Verificar se já existe uma entrada especial para esta conta
        const existingEntries = entries.filter(
          (e) =>
            e.type === "ganhos" &&
            e.bankAccountId === entry.bankAccountId &&
            (e.categories.includes("saldo-conta") || e.categories.includes("credito-disponivel")),
        )

        // Se for um ganho em débito, atualizar o saldo em débito da conta
        if (entry.paymentType === "debito") {
          // Encontrar a entrada existente de saldo em conta
          const existingSaldoEntry = existingEntries.find(
            (e) => e.categories.includes("saldo-conta") && e.paymentType === "debito",
          )

          if (existingSaldoEntry) {
            // Atualizar a entrada existente
            setEntries((prev) =>
              prev.map((e) => (e.id === existingSaldoEntry.id ? { ...e, amount: e.amount + entry.amount } : e)),
            )

            // Atualizar o saldo da conta bancária
            updateBankAccount(bankAccount.id, {
              debitBalance: (bankAccount.debitBalance || 0) + entry.amount,
            })

            // Sincronizar com o card Líquido
            setTimeout(() => syncEntriesToLiquido(), 0)

            // Retornar, pois já atualizamos a entrada existente
            return
          }
        }
        // Se for um ganho em crédito, atualizar o limite de crédito da conta
        else if (entry.paymentType === "credito") {
          // Encontrar a entrada existente de crédito disponível
          const existingCreditEntry = existingEntries.find(
            (e) => e.categories.includes("credito-disponivel") && e.paymentType === "credito",
          )

          if (existingCreditEntry) {
            // Atualizar a entrada existente
            setEntries((prev) =>
              prev.map((e) => (e.id === existingCreditEntry.id ? { ...e, amount: e.amount + entry.amount } : e)),
            )

            // Atualizar o limite de crédito da conta bancária
            updateBankAccount(bankAccount.id, {
              creditLimit: (bankAccount.creditLimit || 0) + entry.amount,
            })

            // Sincronizar com o card Líquido
            setTimeout(() => syncEntriesToLiquido(), 0)

            // Retornar, pois já atualizamos a entrada existente
            return
          }
        }
      }
    }

    // Se não for um ganho associado a uma conta ou não encontramos uma entrada existente para atualizar,
    // adicionar como uma nova entrada normal
    const newEntry = {
      ...entry,
      date: entryDate,
      id: Math.random().toString(36).substring(2, 9),
    }

    setEntries((prev) => {
      const updatedEntries = [...prev, newEntry]

      // Atualizar o saldo da conta bancária se necessário
      if (newEntry.bankAccountId) {
        updateBankAccountFromEntry(newEntry)
      }

      // Programar a sincronização para o próximo ciclo de renderização
      setTimeout(() => syncEntriesToLiquido(), 0)
      return updatedEntries
    })
  }

  // Remover uma entrada
  const removeEntry = (id: string) => {
    // Obter a entrada antes de removê-la
    const entryToRemove = entries.find((entry) => entry.id === id)

    setEntries((prev) => {
      const updatedEntries = prev.filter((entry) => entry.id !== id)

      // Se a entrada removida estava associada a uma conta bancária, atualizar o saldo da conta
      if (entryToRemove && entryToRemove.bankAccountId) {
        const account = getBankAccountById(entryToRemove.bankAccountId)
        if (account) {
          // Atualizar o saldo da conta bancária com base no tipo de entrada
          if (entryToRemove.type === "ganhos") {
            if (entryToRemove.paymentType === "debito") {
              // Se for um ganho em débito, subtrair do saldo em débito da conta
              updateBankAccount(account.id, {
                debitBalance: Math.max(0, (account.debitBalance || 0) - entryToRemove.amount),
              })
            } else if (entryToRemove.paymentType === "credito") {
              // Se for um ganho em crédito, subtrair do limite de crédito da conta
              updateBankAccount(account.id, {
                creditLimit: Math.max(0, (account.creditLimit || 0) - entryToRemove.amount),
              })
            }
          } else if (entryToRemove.type === "custo-variado" && entryToRemove.paymentType === "credito") {
            // Se for um custo variado em crédito, subtrair do crédito utilizado da conta
            updateBankAccount(account.id, {
              creditUsed: Math.max(0, (account.creditUsed || 0) - entryToRemove.amount),
            })
          }
        }
      }

      // Programar a sincronização para o próximo ciclo de renderização
      setTimeout(() => syncEntriesToLiquido(), 0)
      return updatedEntries
    })
  }

  // Atualizar uma entrada existente
  const updateEntry = (id: string, updates: Partial<Omit<FinanceEntry, "id">>) => {
    // Obter a entrada antes de atualizá-la
    const oldEntry = entries.find((entry) => entry.id === id)

    setEntries((prev) => {
      const updatedEntries = prev.map((entry) => {
        if (entry.id === id) {
          const updatedEntry = { ...entry, ...updates }

          // Se a entrada atualizada está associada a uma conta bancária, atualizar o saldo da conta
          if (updatedEntry.bankAccountId) {
            // Se o valor da entrada mudou
            if (oldEntry && oldEntry.amount !== updatedEntry.amount) {
              const account = getBankAccountById(updatedEntry.bankAccountId)
              if (account) {
                // Calcular a diferença de valor
                const amountDiff = updatedEntry.amount - oldEntry.amount

                // Atualizar o saldo da conta bancária com base no tipo de entrada
                if (updatedEntry.type === "ganhos") {
                  if (updatedEntry.paymentType === "debito") {
                    // Se for um ganho em débito, atualizar o saldo em débito da conta
                    updateBankAccount(account.id, {
                      debitBalance: Math.max(0, (account.debitBalance || 0) + amountDiff),
                    })
                  } else if (updatedEntry.paymentType === "credito") {
                    // Se for um ganho em crédito, atualizar o limite de crédito da conta
                    updateBankAccount(account.id, {
                      creditLimit: Math.max(0, (account.creditLimit || 0) + amountDiff),
                    })
                  }
                } else if (updatedEntry.type === "custo-variado" && updatedEntry.paymentType === "credito") {
                  // Se for um custo variado em crédito, atualizar o crédito utilizado da conta
                  updateBankAccount(account.id, {
                    creditUsed: Math.max(0, (account.creditUsed || 0) + amountDiff),
                  })
                }
              }
            }
          }

          return updatedEntry
        }
        return entry
      })

      // Programar a sincronização para o próximo ciclo de renderização
      setTimeout(() => syncEntriesToLiquido(), 0)
      return updatedEntries
    })
  }

  // Obter entradas por tipo
  const getEntriesByType = (type: FinanceEntry["type"]) => {
    return entries.filter((entry) => entry.type === type)
  }

  // Obter total por tipo e tipo de pagamento (opcional)
  // Modificado para considerar apenas entradas validadas
  const getTotalByType = (type: FinanceEntry["type"], paymentType?: "debito" | "credito") => {
    return entries
      .filter(
        (entry) => entry.type === type && (paymentType ? entry.paymentType === paymentType : true) && entry.isValidated,
      )
      .reduce((total, entry) => total + entry.amount, 0)
  }

  // Atualizar a função getNetAmount para subtrair corretamente os valores por tipo de pagamento
  // Obter valor líquido (ganhos - despesas)
  const getNetAmount = () => {
    const debitoIncome = getTotalByType("ganhos", "debito")
    const creditoIncome = getTotalByType("ganhos", "credito")

    const debitoExpenses =
      getTotalByType("custo-fixo", "debito") +
      getTotalByType("custo-variado", "debito") +
      getTotalByType("parcela", "debito") +
      getTotalByType("gastos", "debito")

    const creditoExpenses =
      getTotalByType("custo-fixo", "credito") +
      getTotalByType("custo-variado", "credito") +
      getTotalByType("parcela", "credito") +
      getTotalByType("gastos", "credito")

    return {
      debito: Math.max(0, debitoIncome - debitoExpenses),
      credito: Math.max(0, creditoIncome - creditoExpenses),
    }
  }

  // Calcular orçamento diário original (sem ajustes)
  const getDailyBudget = () => {
    const net = getNetAmount()
    const totalNet = net.debito * (spendingAllocation.debito / 100) + net.credito * (spendingAllocation.credito / 100)

    // Dividir por 30 dias (simplificação)
    const dailyBudget = totalNet / 30

    // Não atualizar o estado diretamente aqui
    // Remover este bloco:
    /*
    if (dailyBudgetInfo.originalBudget !== dailyBudget) {
      setDailyBudgetInfo((prev) => ({
        ...prev,
        originalBudget: dailyBudget,
        adjustedBudget: prev.excess > 0 ? dailyBudget - prev.excess : dailyBudget,
      }))
    }
    */

    // Em vez disso, apenas retornar o valor calculado
    return dailyBudget
  }

  // Obter o orçamento diário ajustado (considerando excesso)
  const getAdjustedDailyBudget = () => {
    // Garantir que o orçamento original esteja atualizado
    const originalBudget = getDailyBudget()
    return dailyBudgetInfo.adjustedBudget
  }

  // Obter o valor de excesso
  const getExcessAmount = () => {
    return dailyBudgetInfo.excess
  }

  // Calcular o excesso diário
  const calculateDailyExcess = () => {
    const today = new Date().toISOString().split("T")[0]

    // Se já calculamos o excesso hoje, não fazer nada
    if (today === lastExcessCalculationDate || today === dailyBudgetInfo.date) {
      return
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayString = yesterday.toISOString().split("T")[0]

    // Obter gastos de ontem
    let yesterdayTotal = 0
    entries.forEach((entry) => {
      const entryDateString = entry.date.toISOString().split("T")[0]
      if (entryDateString === yesterdayString && entry.type === "gastos" && entry.isValidated) {
        yesterdayTotal += entry.amount
      }
    })

    // Calcular excesso (se gasto de ontem > orçamento ajustado de ontem)
    const originalBudget = dailyBudgetInfo.originalBudget
    const yesterdayBudget = dailyBudgetInfo.adjustedBudget

    // Se o usuário gastou exatamente o valor ajustado, resetar o excesso
    if (Math.abs(yesterdayTotal - yesterdayBudget) < 0.01) {
      setDailyBudgetInfo({
        originalBudget: originalBudget,
        adjustedBudget: originalBudget,
        excess: 0,
        date: today,
      })
      setLastExcessCalculationDate(today)
      return
    }

    // Se o usuário gastou mais que o valor ajustado, calcular novo excesso
    const newExcess = Math.max(0, yesterdayTotal - yesterdayBudget)
    const totalExcess = dailyBudgetInfo.excess + newExcess

    // Ajustar orçamento para hoje
    const todayAdjustedBudget = originalBudget - totalExcess

    setDailyBudgetInfo({
      originalBudget: originalBudget,
      adjustedBudget: todayAdjustedBudget,
      excess: totalExcess,
      date: today,
    })

    setLastExcessCalculationDate(today)
  }

  // Calcular orçamento semanal
  const getWeeklyBudget = () => {
    const dailyBudget = getAdjustedDailyBudget()
    return dailyBudget * 7
  }

  // Calcular orçamento mensal
  const getMonthlyBudget = () => {
    const dailyBudget = getAdjustedDailyBudget()
    return dailyBudget * 30
  }

  // Obter o total gasto hoje - CORRIGIDO para considerar apenas gastos do tipo "gastos"
  const getTodayTotal = () => {
    const today = new Date()
    const todayString = today.toISOString().split("T")[0] // YYYY-MM-DD

    let total = 0

    // Somar apenas os gastos do tipo "gastos" de hoje
    entries.forEach((entry) => {
      const entryDateString = entry.date.toISOString().split("T")[0]

      if (entryDateString === todayString && entry.type === "gastos" && entry.isValidated) {
        total += entry.amount
      }
    })

    return total
  }

  // Obter o total gasto na semana - CORRIGIDO para considerar apenas gastos do tipo "gastos"
  const getWeekTotal = () => {
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Fim do dia atual

    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 6) // 7 dias atrás (incluindo hoje)
    weekAgo.setHours(0, 0, 0, 0) // Início do dia 7 dias atrás

    let total = 0

    // Somar apenas os gastos do tipo "gastos" da semana
    entries.forEach((entry) => {
      if (entry.date >= weekAgo && entry.date <= today && entry.type === "gastos" && entry.isValidated) {
        total += entry.amount
      }
    })

    return total
  }

  // Obter o total gasto no mês - CORRIGIDO para considerar apenas gastos do tipo "gastos"
  const getMonthTotal = () => {
    const today = new Date()
    today.setHours(23, 59, 59, 999) // Fim do dia atual

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    firstDayOfMonth.setHours(0, 0, 0, 0) // Início do primeiro dia do mês

    let total = 0

    // Somar apenas os gastos do tipo "gastos" do mês
    entries.forEach((entry) => {
      if (entry.date >= firstDayOfMonth && entry.date <= today && entry.type === "gastos" && entry.isValidated) {
        total += entry.amount
      }
    })

    return total
  }

  // Obter subcategorias por tipo
  const getSubcategories = (type: FinanceEntry["type"]) => {
    return subcategories[type]
  }

  // Adicionar subcategoria
  const addSubcategory = (type: FinanceEntry["type"], subcategory: SubcategoryOption) => {
    setSubcategories((prev) => ({
      ...prev,
      [type]: [...prev[type], subcategory],
    }))
  }

  // Remover subcategoria
  const removeSubcategory = (type: FinanceEntry["type"], value: string) => {
    setSubcategories((prev) => ({
      ...prev,
      [type]: prev[type].filter((item) => item.value !== value),
    }))
  }

  // Obter bancos
  const getBanks = () => {
    return banks
  }

  // Adicionar banco
  const addBank = (bank: SubcategoryOption) => {
    setBanks((prev) => [...prev, bank])
  }

  // Remover banco
  const removeBank = (value: string) => {
    setBanks((prev) => prev.filter((bank) => bank.value !== value))
  }

  // Obter totais por banco
  const getBankTotals = () => {
    const totals: BankTotals = {}

    // Inicializar com "default" para entradas sem banco
    totals["default"] = { debito: 0, credito: 0 }

    // Inicializar totais para cada banco
    banks.forEach((bank) => {
      totals[bank.value] = { debito: 0, credito: 0 }
    })

    // Calcular totais apenas para entradas do tipo "ganhos" e validadas
    entries
      .filter((entry) => entry.type === "ganhos" && entry.isValidated)
      .forEach((entry) => {
        const bankKey = entry.bank || "default"

        if (entry.paymentType === "debito") {
          totals[bankKey].debito += entry.amount
        } else {
          totals[bankKey].credito += entry.amount
        }
      })

    return totals
  }

  // Alternar validação de uma entrada
  const toggleEntryValidation = (id: string) => {
    setEntries((prev) => {
      const updatedEntries = prev.map((entry) =>
        entry.id === id ? { ...entry, isValidated: !entry.isValidated } : entry,
      )
      // Programar a sincronização para o próximo ciclo de renderização
      setTimeout(() => syncEntriesToLiquido(), 0)
      return updatedEntries
    })
  }

  // Processar entradas fixas mensais
  const processMonthlyFixedEntries = () => {
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    // Filtrar entradas fixas
    const fixedEntries = entries.filter((entry) => entry.isFixed)

    // Para cada entrada fixa, criar uma nova entrada para o mês atual se ainda não existir
    fixedEntries.forEach((entry) => {
      // Verificar se já existe uma entrada para este mês
      const existsForCurrentMonth = entries.some(
        (e) =>
          e.description === entry.description &&
          e.type === entry.type &&
          e.date.getMonth() === currentMonth &&
          e.date.getFullYear() === currentYear,
      )

      // Se não existir, criar uma nova entrada
      if (!existsForCurrentMonth) {
        const newDate = new Date(currentYear, currentMonth, today.getDate())

        addEntry({
          description: entry.description,
          amount: entry.amount,
          date: newDate,
          categories: entry.categories,
          isPaid: false, // Começa como não pago
          isFixed: entry.isFixed,
          location: entry.location,
          type: entry.type,
          paymentType: entry.paymentType,
          bank: entry.bank,
          isValidated: entry.type !== "ganhos", // Ganhos automáticos começam não validados
          bankAccountId: entry.bankAccountId,
        })
      }
    })
  }

  // Sincronizar entradas com o card Liquido
  const syncEntriesToLiquido = () => {
    // Recalcular os valores líquidos com base nas entradas
    const debitoIncome = getTotalByType("ganhos", "debito")
    const creditoIncome = getTotalByType("ganhos", "credito")

    const debitoExpenses =
      getTotalByType("custo-fixo", "debito") +
      getTotalByType("custo-variado", "debito") +
      getTotalByType("parcela", "debito") +
      getTotalByType("gastos", "debito")

    const creditoExpenses =
      getTotalByType("custo-fixo", "credito") +
      getTotalByType("custo-variado", "credito") +
      getTotalByType("parcela", "credito") +
      getTotalByType("gastos", "credito")

    // Calcular valores líquidos
    const liquidoDebito = Math.max(0, debitoIncome - debitoExpenses)
    const liquidoCredito = Math.max(0, creditoIncome - creditoExpenses)

    // Atualizar os valores alocados
    setAllocatedDebit(liquidoDebito)
    setAllocatedCredit(liquidoCredito)

    // Verificar se os valores das contas bancárias estão sincronizados com as entradas
    // e atualizar se necessário
    updateBankAccountsFromEntries()
  }

  // Nova função para atualizar contas bancárias com base nas entradas
  const updateBankAccountsFromEntries = () => {
    // Para cada conta bancária
    bankAccounts.forEach((account) => {
      // Obter todas as entradas associadas a esta conta
      const accountEntries = entries.filter((entry) => entry.bankAccountId === account.id && entry.isValidated)

      // Calcular o saldo em débito total
      const debitEntries = accountEntries.filter((entry) => entry.type === "ganhos" && entry.paymentType === "debito")
      const totalDebit = debitEntries.reduce((sum, entry) => sum + entry.amount, 0)

      // Calcular o limite de crédito total
      const creditEntries = accountEntries.filter((entry) => entry.type === "ganhos" && entry.paymentType === "credito")
      const totalCredit = creditEntries.reduce((sum, entry) => sum + entry.amount, 0)

      // Calcular o crédito utilizado total
      const usedCreditEntries = accountEntries.filter(
        (entry) => entry.type === "custo-variado" && entry.paymentType === "credito",
      )
      const totalUsedCredit = usedCreditEntries.reduce((sum, entry) => sum + entry.amount, 0)

      // Verificar se os valores da conta bancária precisam ser atualizados
      const needsUpdate =
        (account.debitBalance || 0) !== totalDebit ||
        (account.creditLimit || 0) !== totalCredit ||
        (account.creditUsed || 0) !== totalUsedCredit

      // Se precisar atualizar, fazer a atualização
      if (needsUpdate) {
        updateBankAccount(account.id, {
          debitBalance: totalDebit,
          creditLimit: totalCredit,
          creditUsed: totalUsedCredit,
        })
      }
    })
  }

  // New bank account methods
  const addBankAccount = (account: Omit<BankAccount, "id">) => {
    const newAccount = {
      ...account,
      id: Math.random().toString(36).substring(2, 9),
    }
    setBankAccounts((prev) => [...prev, newAccount])
  }

  const updateBankAccount = (id: string, updates: Partial<BankAccount>) => {
    setBankAccounts((prev) => prev.map((account) => (account.id === id ? { ...account, ...updates } : account)))
  }

  const removeBankAccount = (id: string) => {
    setBankAccounts((prev) => prev.filter((account) => account.id !== id))
  }

  const getBankAccountById = (id: string) => {
    return bankAccounts.find((account) => account.id === id)
  }

  const getAvailableFunds = () => {
    return calculateTotalAvailable(bankAccounts)
  }

  // Recalcular saldos das contas bancárias
  const recalculateAllBankAccountBalances = () => {
    // Não precisamos recalcular os saldos, pois agora estamos usando as entradas para isso
    // Apenas retornar os valores atuais
    return getAvailableFunds()
  }

  // Obter orçamento baseado nas contas bancárias
  const getBankBasedBudget = () => {
    // Calcular dias restantes no mês atual
    const today = new Date()
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    const daysRemainingInMonth = lastDayOfMonth.getDate() - today.getDate() + 1 // +1 para incluir o dia atual

    // Se temos valores alocados, usá-los
    if (allocatedDebit > 0 || allocatedCredit > 0) {
      const totalAllocated = allocatedDebit + allocatedCredit

      // Se estamos no último dia do mês, todo o valor está disponível para hoje
      if (daysRemainingInMonth <= 1) {
        return {
          daily: totalAllocated,
          weekly: totalAllocated,
          monthly: totalAllocated,
        }
      }

      // Caso contrário, dividir pelo número de dias restantes
      const dailyBudget = totalAllocated / daysRemainingInMonth

      // Para o orçamento semanal, verificar se temos pelo menos 7 dias restantes
      const weeklyBudget = daysRemainingInMonth >= 7 ? dailyBudget * 7 : totalAllocated // Se temos menos de 7 dias, o orçamento semanal é o total

      return {
        daily: dailyBudget,
        weekly: weeklyBudget,
        monthly: totalAllocated,
      }
    }

    // Caso contrário, usar os valores disponíveis das contas bancárias
    const { totalDebit, totalCredit, totalAvailable } = getAvailableFunds()

    // Se estamos no último dia do mês, todo o valor está disponível para hoje
    if (daysRemainingInMonth <= 1) {
      return {
        daily: totalAvailable,
        weekly: totalAvailable,
        monthly: totalAvailable,
      }
    }

    // Caso contrário, dividir pelo número de dias restantes
    const dailyBudget = totalAvailable / daysRemainingInMonth

    // Para o orçamento semanal, verificar se temos pelo menos 7 dias restantes
    const weeklyBudget = daysRemainingInMonth >= 7 ? dailyBudget * 7 : totalAvailable // Se temos menos de 7 dias, o orçamento semanal é o total

    return {
      daily: dailyBudget,
      weekly: weeklyBudget,
      monthly: totalAvailable,
    }
  }

  // Obter valores alocados
  const getAllocatedFunds = () => {
    return {
      debit: allocatedDebit,
      credit: allocatedCredit,
      total: allocatedDebit + allocatedCredit,
    }
  }

  // Definir valores alocados
  const setAllocatedFunds = (debit: number, credit: number) => {
    setAllocatedDebit(debit)
    setAllocatedCredit(credit)
  }

  // Atualizar o orçamento diário quando necessário
  useEffect(() => {
    const net = getNetAmount()
    const totalNet = net.debito * (spendingAllocation.debito / 100) + net.credito * (spendingAllocation.credito / 100)
    const dailyBudget = totalNet / 30

    if (dailyBudgetInfo.originalBudget !== dailyBudget) {
      setDailyBudgetInfo((prev) => ({
        ...prev,
        originalBudget: dailyBudget,
        adjustedBudget: prev.excess > 0 ? dailyBudget - prev.excess : dailyBudget,
      }))
    }
  }, [entries, spendingAllocation])

  return (
    <FinanceContext.Provider
      value={{
        entries,
        addEntry,
        removeEntry,
        updateEntry,
        getEntriesByType,
        getTotalByType,
        getNetAmount,
        getSpendingAllocation: () => spendingAllocation,
        setSpendingAllocation,
        getDailyBudget,
        getAdjustedDailyBudget,
        getExcessAmount,
        getWeeklyBudget,
        getMonthlyBudget,
        getTodayTotal,
        getWeekTotal,
        getMonthTotal,
        getSubcategories,
        addSubcategory,
        removeSubcategory,
        getBanks,
        addBank,
        removeBank,
        getBankTotals,
        toggleEntryValidation,
        processMonthlyFixedEntries,
        calculateDailyExcess,
        // Bank account methods
        bankAccounts,
        addBankAccount,
        updateBankAccount,
        removeBankAccount,
        getBankAccountById,
        getAvailableFunds,
        // New method
        recalculateAllBankAccountBalances,
        // Métodos para orçamento baseado em contas bancárias
        getBankBasedBudget,
        getAllocatedFunds,
        setAllocatedFunds,
        syncEntriesToLiquido,
      }}
    >
      {children}
    </FinanceContext.Provider>
  )
}

// Hook para usar o contexto
export function useFinance() {
  const context = useContext(FinanceContext)
  if (context === undefined) {
    throw new Error("useFinance must be used within a FinanceProvider")
  }
  return context
}

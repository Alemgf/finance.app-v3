import { supabase } from "./supabase"

// Tipos
export type User = {
  id: string
  name: string
  email: string
  avatar?: string
  motivationalQuote?: string
}

export type Goal = {
  id: string
  name: string
  targetAmount: number
  savedAmount: number
  startDate: Date
  endDate: Date
  dailyBudget: number
}

export type Expense = {
  id: string
  amount: number
  date: Date
  description: string
  category: string
}

export type BudgetAdjustment = {
  id: string
  userId: string
  goalId: string
  adjustmentDate: Date
  adjustedAmount: number
  excess: number
}

// Função para autenticar usuário
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single()

    if (error || !data) {
      console.error("Erro ao autenticar usuário:", error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      motivationalQuote: data.motivational_quote,
    }
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error)
    return null
  }
}

// Função para obter um usuário pelo ID
export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error || !data) {
      console.error("Erro ao buscar usuário por ID:", error)
      return null
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      motivationalQuote: data.motivational_quote,
    }
  } catch (error) {
    console.error("Erro ao buscar usuário por ID:", error)
    return null
  }
}

// Função para criar um novo usuário
export async function createUser(userData: {
  name: string
  email: string
  password: string
  avatar?: string
  motivationalQuote?: string
}): Promise<User | null> {
  try {
    // Verificar se o email já existe
    const { data: existingUser } = await supabase.from("users").select("id").eq("email", userData.email).single()

    if (existingUser) {
      throw new Error("Este email já está em uso")
    }

    // Inserir o novo usuário - SEM o campo created_at
    const { data, error } = await supabase
      .from("users")
      .insert([
        {
          name: userData.name,
          email: userData.email,
          password: userData.password, // Em produção, deveria usar hash
          avatar: userData.avatar || "👤",
          motivational_quote: userData.motivationalQuote || "Economize hoje para um amanhã melhor",
          // Removido o campo created_at que estava causando o erro
        },
      ])
      .select()

    if (error || !data || data.length === 0) {
      console.error("Erro ao criar usuário:", error)
      return null
    }

    return {
      id: data[0].id,
      name: data[0].name,
      email: data[0].email,
      avatar: data[0].avatar,
      motivationalQuote: data[0].motivational_quote,
    }
  } catch (error: any) {
    console.error("Erro ao criar usuário:", error)
    throw error
  }
}

// Função para obter usuário por email e senha
export async function getUser(email: string, password: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .eq("password", password)
      .single()

    if (error) {
      console.error("Erro ao obter usuário:", error)
      return null
    }

    if (!data) {
      return null
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      avatar: data.avatar,
      motivationalQuote: data.motivational_quote,
    }
  } catch (error) {
    console.error("Erro ao obter usuário:", error)
    return null
  }
}

// Função para criar um ajuste de orçamento
export async function createBudgetAdjustment(
  adjustmentData: Omit<BudgetAdjustment, "id">,
): Promise<BudgetAdjustment | null> {
  try {
    const { data, error } = await supabase
      .from("budget_adjustments")
      .insert([
        {
          user_id: adjustmentData.userId,
          goal_id: adjustmentData.goalId,
          adjustment_date: adjustmentData.adjustmentDate.toISOString(),
          adjusted_amount: adjustmentData.adjustedAmount,
          excess: adjustmentData.excess,
        },
      ])
      .select()

    if (error || !data || data.length === 0) {
      console.error("Erro ao criar ajuste de orçamento:", error)
      return null
    }

    return {
      id: data[0].id,
      userId: data[0].user_id,
      goalId: data[0].goal_id,
      adjustmentDate: new Date(data[0].adjustment_date),
      adjustedAmount: data[0].adjusted_amount,
      excess: data[0].excess,
    }
  } catch (error) {
    console.error("Erro ao criar ajuste de orçamento:", error)
    return null
  }
}

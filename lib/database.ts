import { supabase } from "./supabase-client"
import { v4 as uuidv4 } from "uuid"

// Types that match the database schema
export interface User {
  id: string
  name: string
  email: string
  password?: string // In a real app, this would be hashed
}

export interface Goal {
  id: string
  userId: string
  name: string
  targetAmount: number
  savedAmount: number
  startDate: Date
  endDate: Date
  dailyBudget: number
}

export interface Expense {
  id: string
  userId: string
  goalId?: string
  date: Date
  description: string
  amount: number
  location?: string
  isPaid: boolean
  isFixed: boolean
  paymentType: string
  isValidated: boolean
  categories: string[]
  bank?: string
  type: string
}

export interface BudgetAdjustment {
  id: string
  userId: string
  goalId: string
  adjustmentDate: Date
  adjustedAmount: number
  excess: number
}

// Helper functions to convert between database and app formats
const convertDbGoalToAppGoal = (dbGoal: any): Goal => ({
  id: dbGoal.id,
  userId: dbGoal.user_id,
  name: dbGoal.name,
  targetAmount: dbGoal.target_amount,
  savedAmount: dbGoal.saved_amount,
  startDate: new Date(dbGoal.start_date),
  endDate: new Date(dbGoal.end_date),
  dailyBudget: dbGoal.daily_budget,
})

const convertDbExpenseToAppExpense = (dbExpense: any): Expense => ({
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
})

const convertDbAdjustmentToAppAdjustment = (dbAdjustment: any): BudgetAdjustment => ({
  id: dbAdjustment.id,
  userId: dbAdjustment.user_id,
  goalId: dbAdjustment.goal_id,
  adjustmentDate: new Date(dbAdjustment.adjustment_date),
  adjustedAmount: dbAdjustment.adjusted_amount,
  excess: dbAdjustment.excess,
})

// Database functions
export async function createUser(user: Omit<User, "id">): Promise<User> {
  const { data, error } = await supabase
    .from("users")
    .insert({
      id: uuidv4(),
      name: user.name,
      email: user.email,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    name: data.name,
    email: data.email,
  }
}

export async function createGoal(goal: Omit<Goal, "id">): Promise<Goal> {
  const { data, error } = await supabase
    .from("goals")
    .insert({
      id: uuidv4(),
      user_id: goal.userId,
      name: goal.name,
      target_amount: goal.targetAmount,
      saved_amount: goal.savedAmount,
      start_date: goal.startDate.toISOString(),
      end_date: goal.endDate.toISOString(),
      daily_budget: goal.dailyBudget,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  return convertDbGoalToAppGoal(data)
}

export async function createExpense(expense: Omit<Expense, "id">): Promise<Expense> {
  const { data, error } = await supabase
    .from("expenses")
    .insert({
      id: uuidv4(),
      user_id: expense.userId,
      goal_id: expense.goalId,
      date: expense.date.toISOString(),
      description: expense.description,
      amount: expense.amount,
      location: expense.location,
      is_paid: expense.isPaid,
      is_fixed: expense.isFixed,
      payment_type: expense.paymentType,
      is_validated: expense.isValidated,
      categories: expense.categories,
      bank: expense.bank,
      type: expense.type,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  return convertDbExpenseToAppExpense(data)
}

export async function updateExpense(id: string, expense: Partial<Omit<Expense, "id">>): Promise<Expense> {
  const updates: any = {}

  if (expense.userId) updates.user_id = expense.userId
  if (expense.goalId !== undefined) updates.goal_id = expense.goalId
  if (expense.date) updates.date = expense.date.toISOString()
  if (expense.description) updates.description = expense.description
  if (expense.amount !== undefined) updates.amount = expense.amount
  if (expense.location !== undefined) updates.location = expense.location
  if (expense.isPaid !== undefined) updates.is_paid = expense.isPaid
  if (expense.isFixed !== undefined) updates.is_fixed = expense.isFixed
  if (expense.paymentType) updates.payment_type = expense.paymentType
  if (expense.isValidated !== undefined) updates.is_validated = expense.isValidated
  if (expense.categories) updates.categories = expense.categories
  if (expense.bank !== undefined) updates.bank = expense.bank
  if (expense.type) updates.type = expense.type

  const { data, error } = await supabase.from("expenses").update(updates).eq("id", id).select().single()

  if (error) throw error

  return convertDbExpenseToAppExpense(data)
}

export async function deleteExpense(id: string): Promise<void> {
  const { error } = await supabase.from("expenses").delete().eq("id", id)

  if (error) throw error
}

export async function createBudgetAdjustment(adjustment: Omit<BudgetAdjustment, "id">): Promise<BudgetAdjustment> {
  const { data, error } = await supabase
    .from("budget_adjustments")
    .insert({
      id: uuidv4(),
      user_id: adjustment.userId,
      goal_id: adjustment.goalId,
      adjustment_date: adjustment.adjustmentDate.toISOString(),
      adjusted_amount: adjustment.adjustedAmount,
      excess: adjustment.excess,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error

  return convertDbAdjustmentToAppAdjustment(data)
}

export async function getUserGoals(userId: string): Promise<Goal[]> {
  const { data, error } = await supabase.from("goals").select("*").eq("user_id", userId)

  if (error) throw error

  return data.map(convertDbGoalToAppGoal)
}

export async function getUserExpenses(userId: string, date?: Date): Promise<Expense[]> {
  let query = supabase.from("expenses").select("*").eq("user_id", userId)

  if (date) {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    query = query.gte("date", startOfDay.toISOString()).lte("date", endOfDay.toISOString())
  }

  const { data, error } = await query

  if (error) throw error

  return data.map(convertDbExpenseToAppExpense)
}

export async function getLatestBudgetAdjustment(userId: string, goalId: string): Promise<BudgetAdjustment | null> {
  const { data, error } = await supabase
    .from("budget_adjustments")
    .select("*")
    .eq("user_id", userId)
    .eq("goal_id", goalId)
    .order("adjustment_date", { ascending: false })
    .limit(1)

  if (error) throw error

  return data.length > 0 ? convertDbAdjustmentToAppAdjustment(data[0]) : null
}

export async function getUserCategories(userId: string, type: string): Promise<{ label: string; value: string }[]> {
  const { data, error } = await supabase.from("categories").select("*").eq("user_id", userId).eq("type", type)

  if (error) throw error

  return data.map((cat) => ({
    label: cat.label,
    value: cat.value,
  }))
}

export async function addUserCategory(userId: string, type: string, label: string, value: string): Promise<void> {
  const { error } = await supabase.from("categories").insert({
    id: uuidv4(),
    user_id: userId,
    type,
    label,
    value,
    created_at: new Date().toISOString(),
  })

  if (error) throw error
}

export async function removeUserCategory(userId: string, type: string, value: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("user_id", userId).eq("type", type).eq("value", value)

  if (error) throw error
}

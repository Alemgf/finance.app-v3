import { type Goal, type Expense, type BudgetAdjustment, createBudgetAdjustment } from "./database"

export async function calculateDailyBudget(
  userId: string,
  goalId: string,
  goal: Goal,
  todayExpenses: Expense[],
  yesterdayExpenses: Expense[],
  latestAdjustment: BudgetAdjustment | null,
): Promise<{ dailyBudget: number; excess: number }> {
  // Calculate the total spent yesterday
  const yesterdayTotal = yesterdayExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Get the original daily budget from the goal
  const originalDailyBudget = goal.dailyBudget

  // Get the adjusted budget for yesterday (if any)
  const yesterdayBudget = latestAdjustment ? latestAdjustment.adjustedAmount : originalDailyBudget

  // Calculate excess spending from yesterday
  const excess = Math.max(0, yesterdayTotal - yesterdayBudget)

  // Calculate today's budget
  const todayBudget = excess > 0 ? originalDailyBudget - excess : originalDailyBudget

  // If there was excess spending, create a new budget adjustment
  if (excess > 0) {
    await createBudgetAdjustment({
      userId,
      goalId,
      adjustmentDate: new Date(),
      adjustedAmount: todayBudget,
      excess,
    })
  }

  // Calculate remaining budget for today
  const todayTotal = todayExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const remainingBudget = Math.max(0, todayBudget - todayTotal)

  return {
    dailyBudget: remainingBudget,
    excess,
  }
}

export function calculateGoalProgress(
  goal: Goal,
  expenses: Expense[],
): { savedAmount: number; percentage: number; daysLeft: number } {
  // Calculate total saved amount
  const savedAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Calculate percentage of goal completed
  const percentage = (savedAmount / goal.targetAmount) * 100

  // Calculate days left until goal end date
  const today = new Date()
  const daysLeft = Math.ceil((goal.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return {
    savedAmount,
    percentage,
    daysLeft,
  }
}

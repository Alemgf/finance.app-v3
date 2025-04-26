import { Suspense } from "react"
import ExpensesClient from "./expenses-client"
import { ExpenseProvider } from "@/lib/expense-context"

export default function ExpensesPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Carregando despesas...</div>}>
      <ExpenseProvider>
        <ExpensesClient />
      </ExpenseProvider>
    </Suspense>
  )
}

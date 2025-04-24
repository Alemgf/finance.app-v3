"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Filter, Plus, ShoppingBag, Coffee, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useExpenses } from "@/lib/expense-context"

// Mapeamento de ícones por categoria
const categoryIcons = {
  groceries: ShoppingCart,
  food: Coffee,
  shopping: ShoppingBag,
  default: ShoppingCart,
}

// Agrupar gastos por data
const groupExpensesByDate = (expenses) => {
  const grouped = {}

  expenses.forEach((expense) => {
    const dateStr = expense.date.toDateString()
    if (!grouped[dateStr]) {
      grouped[dateStr] = {
        date: expense.date,
        expenses: [],
        total: 0,
      }
    }
    grouped[dateStr].expenses.push(expense)
    grouped[dateStr].total += expense.amount
  })

  return Object.values(grouped).sort((a, b) => b.date - a.date)
}

export default function ExpensesPage() {
  const { expenses, getTodayTotal, getWeekTotal, getMonthTotal } = useExpenses()

  const groupedExpenses = groupExpensesByDate(expenses)

  // Obter totais
  const totalToday = getTodayTotal()
  const totalWeek = getWeekTotal()
  const totalMonth = getMonthTotal()

  return (
    <div className="container max-w-md mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold">Gastos</h1>
        <div className="flex gap-2">
          <Button size="icon" variant="outline">
            <Filter className="h-4 w-4" />
          </Button>
          <Link href="/expenses/new">
            <Button size="icon" variant="outline">
              <Plus className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumo de Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="today">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="today">Hoje</TabsTrigger>
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
            </TabsList>
            <TabsContent value="today" className="pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold">R${totalToday.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total gasto hoje</div>
              </div>
            </TabsContent>
            <TabsContent value="week" className="pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold">R${totalWeek.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total gasto na semana</div>
              </div>
            </TabsContent>
            <TabsContent value="month" className="pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold">R${totalMonth.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">Total gasto no mês</div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {groupedExpenses.length > 0 ? (
          groupedExpenses.map((group, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">
                    {group.date.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                  </CardTitle>
                  <div className="font-bold">R${group.total.toFixed(2)}</div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {group.expenses.map((expense) => {
                  // Determinar qual ícone usar
                  const IconComponent =
                    expense.category && categoryIcons[expense.category]
                      ? categoryIcons[expense.category]
                      : categoryIcons.default

                  return (
                    <div key={expense.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{expense.description}</p>
                        </div>
                      </div>
                      <p className="font-medium">R${expense.amount.toFixed(2)}</p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">Nenhum gasto registrado ainda</div>
        )}
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Coffee, ShoppingCart, MoreHorizontal } from "lucide-react"
import { useFinance } from "@/lib/finance-context"
import Link from "next/link"
import { useEffect, useState } from "react"

// Mapeamento de ícones por categoria
const categoryIcons = {
  ganhos: Coffee,
  "custo-fixo": ShoppingBag,
  "custo-variado": ShoppingCart,
  parcela: ShoppingBag,
  gastos: ShoppingCart,
  default: ShoppingCart,
}

export function RecentExpensesCard() {
  const { entries, getTodayTotal } = useFinance()
  const [todayTotal, setTodayTotal] = useState(0)
  const [recentExpenses, setRecentExpenses] = useState<any[]>([])

  // Atualizar valores quando a página carrega ou quando há mudanças
  useEffect(() => {
    // Obter o total gasto hoje
    const todayTotalValue = getTodayTotal()
    setTodayTotal(todayTotalValue)

    // Ordenar gastos por data (mais recentes primeiro) e pegar os 5 mais recentes
    // Incluir apenas entradas do tipo "gastos"
    const expenses = [...entries]
      .filter((entry) => entry.type === "gastos" && entry.isValidated)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 5)

    setRecentExpenses(expenses)
  }, [entries]) // Remover getTodayTotal da lista de dependências

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Gastos Recentes</CardTitle>
        <div className="flex items-center gap-2">
          <div className="text-sm font-medium">
            Total hoje: <span className="text-primary">R${todayTotal.toFixed(2)}</span>
          </div>
          <Link href="/expenses">
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentExpenses.length > 0 ? (
          recentExpenses.map((expense) => {
            // Determinar qual ícone usar com base na categoria
            const IconComponent = categoryIcons[expense.type] || categoryIcons.default

            return (
              <div key={expense.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">{expense.description}</p>
                    <p className="text-sm text-muted-foreground">{expense.date.toLocaleDateString("pt-BR")}</p>
                  </div>
                </div>
                <p className="font-medium">R${expense.amount.toFixed(2)}</p>
              </div>
            )
          })
        ) : (
          <div className="text-center py-4 text-muted-foreground">Nenhum gasto registrado ainda</div>
        )}
      </CardContent>
    </Card>
  )
}

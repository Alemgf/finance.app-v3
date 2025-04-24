"use client"

import { RecentExpensesCard } from "@/components/recent-expenses-card"
import { SpendingSummaryCard } from "@/components/spending-summary-card"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { useFinance } from "@/lib/finance-context"
import { useEffect, useState } from "react"
import { themeConfig } from "@/lib/theme-config"
import { CombinedHeaderCard } from "@/components/combined-header-card"
import { BottomMenu } from "@/components/bottom-menu"

export default function HomePage() {
  const { getTodayTotal, getWeekTotal, getMonthTotal, entries, calculateDailyExcess, getBankBasedBudget } = useFinance()

  const [todayTotal, setTodayTotal] = useState(0)
  const [weekTotal, setWeekTotal] = useState(0)
  const [monthTotal, setMonthTotal] = useState(0)
  const [dailyBudget, setDailyBudget] = useState(0)
  const [weeklyBudget, setWeeklyBudget] = useState(0)
  const [monthlyBudget, setMonthlyBudget] = useState(0)

  // Atualizar valores quando a página carrega ou quando há mudanças
  useEffect(() => {
    // Função para atualizar os valores
    const updateValues = () => {
      // Calcular excesso diário se necessário
      calculateDailyExcess()

      const today = getTodayTotal()
      const week = getWeekTotal()
      const month = getMonthTotal()

      // Obter orçamentos baseados nas contas bancárias
      const { daily, weekly, monthly } = getBankBasedBudget()

      setTodayTotal(today)
      setWeekTotal(week)
      setMonthTotal(month)
      setDailyBudget(daily)
      setWeeklyBudget(weekly)
      setMonthlyBudget(monthly)
    }

    // Executar uma vez ao montar o componente
    updateValues()

    // Configurar um intervalo para atualizar periodicamente
    const interval = setInterval(updateValues, 2000)

    // Limpar o intervalo ao desmontar o componente
    return () => clearInterval(interval)
  }, [entries, getTodayTotal, getWeekTotal, getMonthTotal, calculateDailyExcess, getBankBasedBudget])

  return (
    <main className="pb-20" style={{ backgroundColor: themeConfig.colors.background }}>
      <div className="container max-w-md mx-auto p-4 space-y-6">
        <CombinedHeaderCard />

        {/* Card de resumo de gastos */}
        <div
          className="p-4"
          style={{
            backgroundColor: themeConfig.colors.cardBackgroundDark,
            borderRadius: themeConfig.borderRadius.medium,
            boxShadow: themeConfig.shadows.medium,
          }}
        >
          <SpendingSummaryCard
            todayTotal={todayTotal}
            weekTotal={weekTotal}
            monthTotal={monthTotal}
            dailyBudget={dailyBudget}
            weeklyBudget={weeklyBudget}
            monthlyBudget={monthlyBudget}
          />
        </div>

        {/* Card de gastos recentes */}
        <div
          className="p-4"
          style={{
            backgroundColor: themeConfig.colors.cardBackground,
            borderRadius: themeConfig.borderRadius.medium,
            boxShadow: themeConfig.shadows.medium,
          }}
        >
          <RecentExpensesCard />
        </div>
      </div>

      <BottomMenu />

      <div className="fixed bottom-20 right-6">
        <Link href="/expenses/new">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              backgroundColor: themeConfig.colors.cardBackgroundDark,
              boxShadow: themeConfig.shadows.large,
            }}
          >
            <PlusCircle className="h-7 w-7 text-white" />
          </div>
        </Link>
      </div>
    </main>
  )
}

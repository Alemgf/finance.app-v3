"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ArrowDownCircle } from "lucide-react"
import { themeConfig } from "@/lib/theme-config"
import { useFinance } from "@/lib/finance-context"
import { getRemainingDaysInMonth } from "@/lib/bank-account-model"

interface SpendingSummaryCardProps {
  todayTotal: number
  weekTotal: number
  monthTotal: number
  dailyBudget?: number
  weeklyBudget?: number
  monthlyBudget?: number
}

export function SpendingSummaryCard({
  todayTotal,
  weekTotal,
  monthTotal,
  dailyBudget = 0,
  weeklyBudget = 0,
  monthlyBudget = 0,
}: SpendingSummaryCardProps) {
  const [activeTab, setActiveTab] = useState("daily")
  const { getAvailableFunds, getAllocatedFunds } = useFinance()
  const { totalAvailable } = getAvailableFunds()
  const { total: allocatedTotal } = getAllocatedFunds()

  // Calcular orçamentos baseados nos valores alocados ou disponíveis
  const [calculatedDailyBudget, setCalculatedDailyBudget] = useState(0)
  const [calculatedWeeklyBudget, setCalculatedWeeklyBudget] = useState(0)
  const [calculatedMonthlyBudget, setCalculatedMonthlyBudget] = useState(0)

  // Novos estados para os orçamentos dinâmicos
  const [dynamicDailyBudget, setDynamicDailyBudget] = useState(0)
  const [dynamicWeeklyDailyBudget, setDynamicWeeklyDailyBudget] = useState(0)
  const [dynamicMonthlyDailyBudget, setDynamicMonthlyDailyBudget] = useState(0)

  // Estados para valores totais disponíveis por período
  const [totalWeeklyAvailable, setTotalWeeklyAvailable] = useState(0)
  const [totalMonthlyAvailable, setTotalMonthlyAvailable] = useState(0)

  // Estado para armazenar os dias restantes na semana
  const [daysRemainingInWeek, setDaysRemainingInWeek] = useState(0)
  // Estado para armazenar os dias restantes no mês
  const [daysRemainingInMonth, setDaysRemainingInMonth] = useState(0)

  useEffect(() => {
    // Usar o valor alocado se disponível, caso contrário usar o total disponível
    const totalToUse = allocatedTotal > 0 ? allocatedTotal : totalAvailable

    // Calcular dias restantes no mês
    const remainingDaysInMonth = getRemainingDaysInMonth()
    setDaysRemainingInMonth(remainingDaysInMonth)

    // Calcular dias restantes na semana atual (considerando que a semana termina no sábado)
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

    // Se hoje é domingo (0), então estamos no primeiro dia da nova semana
    // Se hoje é sábado (6), então estamos no último dia da semana atual
    const remainingDaysInCurrentWeek = dayOfWeek === 0 ? 7 : 7 - dayOfWeek
    setDaysRemainingInWeek(remainingDaysInCurrentWeek)

    // 1. Orçamento diário base (valor total dividido pelos dias RESTANTES no mês)
    // Modificado conforme solicitado: usar dias restantes em vez de dias totais no mês
    const dailyBaseBudget = remainingDaysInMonth > 0 ? totalToUse / remainingDaysInMonth : 0
    setCalculatedDailyBudget(dailyBaseBudget)

    // 2. Orçamento semanal base (orçamento diário * dias restantes na semana, limitado a 7)
    // Usamos Math.min para garantir que não excedemos 7 dias
    const daysForWeeklyBudget = Math.min(7, remainingDaysInMonth)
    const weeklyBaseBudget = dailyBaseBudget * daysForWeeklyBudget
    setCalculatedWeeklyBudget(weeklyBaseBudget)

    // 3. Orçamento mensal (valor total)
    setCalculatedMonthlyBudget(totalToUse)

    // Calcular orçamentos adaptativos (redistribuindo o não gasto pelos dias restantes)

    // 1. Orçamento diário adaptativo
    // Agora é o mesmo que o orçamento diário base (já calculado com base nos dias restantes)
    const dynamicDaily = dailyBaseBudget
    setDynamicDailyBudget(dynamicDaily)

    // 2. Orçamento diário baseado no semanal adaptativo
    // Fórmula: (Orçamento diário base * dias na semana - Gastos acumulados na semana) ÷ Dias restantes na semana
    const weeklyBudgetForCurrentWeek = dailyBaseBudget * Math.min(7, remainingDaysInCurrentWeek)
    const weeklyRemaining = Math.max(0, weeklyBudgetForCurrentWeek - weekTotal)

    // Se estamos no último dia da semana (sábado), o valor diário é o mesmo que o base
    // Caso contrário, calculamos o valor diário adaptativo
    let dynamicWeeklyDaily = dailyBaseBudget
    if (remainingDaysInCurrentWeek > 0) {
      dynamicWeeklyDaily = weeklyRemaining / remainingDaysInCurrentWeek
    }
    setDynamicWeeklyDailyBudget(dynamicWeeklyDaily)

    // 3. Orçamento diário baseado no mensal adaptativo
    // Fórmula: (Orçamento mensal total - Gastos acumulados no mês) ÷ Dias restantes no mês
    const monthlyRemaining = Math.max(0, totalToUse - monthTotal)
    let dynamicMonthlyDaily = dailyBaseBudget
    if (remainingDaysInMonth > 0) {
      dynamicMonthlyDaily = monthlyRemaining / remainingDaysInMonth
    }
    setDynamicMonthlyDailyBudget(dynamicMonthlyDaily)

    // Calcular valores totais disponíveis por período
    // Para a semana: valor diário adaptativo * dias restantes na semana atual
    const weeklyTotal = dynamicWeeklyDaily * remainingDaysInCurrentWeek
    setTotalWeeklyAvailable(weeklyTotal)

    // Para o mês: valor restante após gastos
    setTotalMonthlyAvailable(monthlyRemaining)
  }, [totalAvailable, allocatedTotal, weekTotal, monthTotal])

  // Usar os orçamentos calculados ou os passados como props
  const finalDailyBudget = dailyBudget > 0 ? dailyBudget : calculatedDailyBudget
  const finalWeeklyBudget = weeklyBudget > 0 ? weeklyBudget : calculatedWeeklyBudget
  const finalMonthlyBudget = monthlyBudget > 0 ? monthlyBudget : calculatedMonthlyBudget

  // Calcular se está acima ou abaixo do orçamento
  const isDailyOverBudget = todayTotal > finalDailyBudget && finalDailyBudget > 0
  const isWeeklyOverBudget = weekTotal > finalWeeklyBudget && finalWeeklyBudget > 0
  const isMonthlyOverBudget = monthTotal > finalMonthlyBudget && finalMonthlyBudget > 0

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-white" style={{ fontFamily: themeConfig.typography.fontFamily }}>
        Orçamento
      </h2>

      <Tabs defaultValue="daily" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="daily" className={activeTab === "daily" ? "text-white" : "text-gray-400"}>
            Diário
          </TabsTrigger>
          <TabsTrigger value="weekly" className={activeTab === "weekly" ? "text-white" : "text-gray-400"}>
            Semanal
          </TabsTrigger>
          <TabsTrigger value="monthly" className={activeTab === "monthly" ? "text-white" : "text-gray-400"}>
            Mensal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-300">Gasto hoje</p>
              <p className="text-2xl font-bold text-white">R$ {todayTotal.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Disponível hoje</p>
              <div className="flex items-center justify-end">
                <ArrowDownCircle className="h-5 w-5 text-green-500 mr-1" />
                <p className="text-2xl font-bold text-green-500">R$ {dynamicDailyBudget.toFixed(2)}</p>
              </div>
              <p className="text-xs text-gray-400">{daysRemainingInMonth} dias restantes no mês</p>
            </div>
          </div>
          {finalDailyBudget > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${isDailyOverBudget ? "bg-red-500" : "bg-green-500"}`}
                style={{
                  width: `${Math.min(100, (todayTotal / finalDailyBudget) * 100)}%`,
                }}
              ></div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-300">Gasto na semana</p>
              <p className="text-2xl font-bold text-white">R$ {weekTotal.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Disponível na semana</p>
              <div className="flex items-center justify-end">
                <ArrowDownCircle className="h-5 w-5 text-green-500 mr-1" />
                <p className="text-2xl font-bold text-green-500">R$ {totalWeeklyAvailable.toFixed(2)}</p>
              </div>
              <p className="text-xs text-gray-400">{daysRemainingInWeek} dias restantes na semana</p>
            </div>
          </div>
          {finalWeeklyBudget > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${isWeeklyOverBudget ? "bg-red-500" : "bg-green-500"}`}
                style={{
                  width: `${Math.min(100, (weekTotal / finalWeeklyBudget) * 100)}%`,
                }}
              ></div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-300">Gasto no mês</p>
              <p className="text-2xl font-bold text-white">R$ {monthTotal.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-300">Disponível no mês</p>
              <div className="flex items-center justify-end">
                <ArrowDownCircle className="h-5 w-5 text-green-500 mr-1" />
                <p className="text-2xl font-bold text-green-500">R$ {totalMonthlyAvailable.toFixed(2)}</p>
              </div>
              <p className="text-xs text-gray-400">{daysRemainingInMonth} dias restantes no mês</p>
            </div>
          </div>
          {finalMonthlyBudget > 0 && (
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className={`h-2.5 rounded-full ${isMonthlyOverBudget ? "bg-red-500" : "bg-green-500"}`}
                style={{
                  width: `${Math.min(100, (monthTotal / finalMonthlyBudget) * 100)}%`,
                }}
              ></div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { getRemainingDaysInMonth } from "@/lib/bank-account-model"

// Modificar a interface para receber os valores reais de gastos
interface DailyBudgetCardProps {
  dailyBudget?: number
  originalBudget?: number
  excessAmount?: number
  weeklyBudget?: number
  monthlyBudget?: number
  todayTotal?: number
  weekTotal?: number
  monthTotal?: number
}

export function DailyBudgetCard({
  dailyBudget,
  originalBudget,
  excessAmount = 0,
  weeklyBudget,
  monthlyBudget,
  todayTotal = 0,
  weekTotal = 0,
  monthTotal = 0,
}: DailyBudgetCardProps) {
  const {
    getExcessAmount,
    getAvailableFunds,
    getAllocatedFunds,
    getTodayTotal,
    getWeekTotal,
    getMonthTotal,
    getAdjustedDailyBudget,
    getWeeklyBudget,
    getMonthlyBudget,
  } = useFinance()
  const [excess, setExcess] = useState(0)
  const { totalAvailable } = getAvailableFunds()
  const { total: allocatedTotal } = getAllocatedFunds()

  // Usar valores fornecidos ou obter do contexto
  const actualTodayTotal = todayTotal !== undefined ? todayTotal : getTodayTotal()
  const actualWeekTotal = weekTotal !== undefined ? weekTotal : getWeekTotal()
  const actualMonthTotal = monthTotal !== undefined ? monthTotal : getMonthTotal()
  const actualDailyBudget = dailyBudget !== undefined ? dailyBudget : getAdjustedDailyBudget()
  const actualWeeklyBudget = weeklyBudget !== undefined ? weeklyBudget : getWeeklyBudget()
  const actualMonthlyBudget = monthlyBudget !== undefined ? monthlyBudget : getMonthlyBudget()
  const actualExcessAmount = excessAmount !== undefined ? excessAmount : getExcessAmount()

  // Modificar o useEffect para evitar o loop infinito
  useEffect(() => {
    // Obter o valor de excesso apenas uma vez ao montar o componente
    // ou quando as entradas mudarem
    const excessAmount = getExcessAmount()
    setExcess(excessAmount)
  }, [getExcessAmount])

  // Calcular valores disponíveis (permitindo valores negativos)
  const availableDaily = actualDailyBudget - actualTodayTotal
  const availableWeekly = actualWeeklyBudget - actualWeekTotal
  const availableMonthly = actualMonthlyBudget - actualMonthTotal

  // Calcular orçamento diário baseado no total disponível das contas
  // Usar o valor alocado se disponível, caso contrário usar o total disponível
  const calculatedDailyBudget = (allocatedTotal > 0 ? allocatedTotal : totalAvailable) / 30
  const calculatedWeeklyBudget = calculatedDailyBudget * 7
  const calculatedMonthlyBudget = calculatedDailyBudget * 30

  // Calcular dias restantes no mês
  const daysRemainingInMonth = getRemainingDaysInMonth()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Orçamento</CardTitle>
        <CardDescription>
          Valor disponível para gastar
          {actualExcessAmount > 0 && (
            <span className="text-red-500 ml-2">(Excesso: R${actualExcessAmount.toFixed(2)})</span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="daily">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="daily">Diário</TabsTrigger>
            <TabsTrigger value="weekly">Semanal</TabsTrigger>
            <TabsTrigger value="monthly">Mensal</TabsTrigger>
          </TabsList>
          <TabsContent value="daily" className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold">R${actualTodayTotal.toFixed(2)}</div>
              <div className={`text-sm ${availableDaily < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                R${calculatedDailyBudget.toFixed(2)} Disponível hoje
              </div>
              <div className="text-xs text-muted-foreground mt-1">{daysRemainingInMonth} dias restantes no mês</div>
            </div>
          </TabsContent>
          <TabsContent value="weekly" className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold">R${actualWeekTotal.toFixed(2)}</div>
              <div className={`text-sm ${availableWeekly < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                R${calculatedWeeklyBudget.toFixed(2)} Disponível esta semana
              </div>
            </div>
          </TabsContent>
          <TabsContent value="monthly" className="pt-4">
            <div className="text-center">
              <div className="text-3xl font-bold">R${actualMonthTotal.toFixed(2)}</div>
              <div className={`text-sm ${availableMonthly < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                R${calculatedMonthlyBudget.toFixed(2)} Disponível este mês
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { TableSummaryCard } from "@/components/table-summary-card"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { CreditCard, Wallet } from "lucide-react"
import { ParcelaDashboardCard } from "@/components/parcela-dashboard-card"

export function TablesTab() {
  const {
    getEntriesByType,
    getTotalByType,
    getNetAmount,
    getSpendingAllocation,
    setSpendingAllocation,
    getDailyBudget,
    getAdjustedDailyBudget,
    getExcessAmount,
    getWeeklyBudget,
    getMonthlyBudget,
    getTodayTotal,
    getWeekTotal,
    getMonthTotal,
    getAvailableFunds,
    getAllocatedFunds,
    setAllocatedFunds,
  } = useFinance()

  // Estados para os valores de débito e crédito
  const [debitoValue, setDebitoValue] = useState(0)
  const [creditoValue, setCreditoValue] = useState(0)
  const [totalForMonth, setTotalForMonth] = useState(0)
  const [totalSafe, setTotalSafe] = useState(0)

  // Obter entradas por tipo
  const ganhosEntries = getEntriesByType("ganhos")
  const custoFixoEntries = getEntriesByType("custo-fixo")
  const custoVariadoEntries = getEntriesByType("custo-variado")
  const parcelaEntries = getEntriesByType("parcela")
  const gastosEntries = getEntriesByType("gastos")

  // Obter totais por tipo
  const ganhosTotal = getTotalByType("ganhos")
  const custoFixoTotal = getTotalByType("custo-fixo")
  const custoVariadoTotal = getTotalByType("custo-variado")
  const parcelaTotal = getTotalByType("parcela")
  const gastosTotal = getTotalByType("gastos")

  // Calcular percentuais
  const totalExpenses = custoFixoTotal + custoVariadoTotal + parcelaTotal + gastosTotal
  const custoFixoPercentage = ganhosTotal > 0 ? Math.round((custoFixoTotal / ganhosTotal) * 100) : 0
  const custoVariadoPercentage = ganhosTotal > 0 ? Math.round((custoVariadoTotal / ganhosTotal) * 100) : 0
  const parcelaPercentage = ganhosTotal > 0 ? Math.round((parcelaTotal / ganhosTotal) * 100) : 0
  const gastosPercentage = ganhosTotal > 0 ? Math.round((gastosTotal / ganhosTotal) * 100) : 0

  // Obter valores líquidos
  const { debito: liquidoDebito, credito: liquidoCredito } = getNetAmount()
  const liquidoTotal = liquidoDebito + liquidoCredito

  // Obter alocação de gastos
  const spendingAllocation = getSpendingAllocation()

  // Remover a chamada direta para getDailyBudget, getAdjustedDailyBudget, etc. durante a renderização
  // Substituir por:

  // Remover estas linhas:
  // Calcular orçamentos
  // Obter fundos disponíveis
  const { totalDebit, totalCredit, totalAvailable } = getAvailableFunds()

  // Adicionar um useEffect para calcular esses valores após a renderização
  useEffect(() => {
    // Calcular orçamentos em um efeito, não durante a renderização
    getDailyBudget()
    getAdjustedDailyBudget()
    getExcessAmount()
    getWeeklyBudget()
    getMonthlyBudget()

    // Obter totais de gastos
    getTodayTotal()
    getWeekTotal()
    getMonthTotal()
  }, [
    getDailyBudget,
    getAdjustedDailyBudget,
    getExcessAmount,
    getWeeklyBudget,
    getMonthlyBudget,
    getTodayTotal,
    getWeekTotal,
    getMonthTotal,
  ])

  // Atualizar valores quando as entradas ou contas bancárias mudarem
  useEffect(() => {
    // Verificar se já temos valores alocados salvos
    const { debit: savedDebit, credit: savedCredit } = getAllocatedFunds()

    // Se temos valores salvos e são válidos, usá-los
    if (savedDebit > 0 || savedCredit > 0) {
      const validDebit = Math.min(savedDebit, totalDebit)
      const validCredit = Math.min(savedCredit, totalCredit)

      setDebitoValue(validDebit)
      setCreditoValue(validCredit)

      // Calcular o total para o mês (soma dos valores ajustados)
      const totalMonth = validDebit + validCredit
      setTotalForMonth(totalMonth)

      // Calcular o total economizado (limite máximo - valor ajustado)
      const totalSaved = totalDebit + totalCredit - totalMonth
      setTotalSafe(totalSaved)
    } else {
      // Inicializar com 50% de cada valor disponível
      const debitoVal = Math.min(totalDebit * 0.5, totalDebit)
      const creditoVal = Math.min(totalCredit * 0.5, totalCredit)

      setDebitoValue(debitoVal)
      setCreditoValue(creditoVal)

      // Calcular o total para o mês (soma dos valores ajustados)
      const totalMonth = debitoVal + creditoVal
      setTotalForMonth(totalMonth)

      // Calcular o total economizado (limite máximo - valor ajustado)
      const totalSaved = totalDebit + totalCredit - totalMonth
      setTotalSafe(totalSaved)

      // Salvar os valores iniciais no contexto
      setAllocatedFunds(debitoVal, creditoVal)
    }
  }, [totalDebit, totalCredit, getAllocatedFunds, setAllocatedFunds])

  const handleDebitoSliderChange = (value: number[]) => {
    if (value.length > 0) {
      setDebitoValue(value[0])

      // Atualizar o total para o mês
      const newTotal = value[0] + creditoValue
      setTotalForMonth(newTotal)

      // Atualizar o total economizado
      setTotalSafe(totalDebit + totalCredit - newTotal)

      // Salvar os valores no contexto
      setAllocatedFunds(value[0], creditoValue)
    }
  }

  const handleCreditoSliderChange = (value: number[]) => {
    if (value.length > 0) {
      setCreditoValue(value[0])

      // Atualizar o total para o mês
      const newTotal = debitoValue + value[0]
      setTotalForMonth(newTotal)

      // Atualizar o total economizado
      setTotalSafe(totalDebit + totalCredit - newTotal)

      // Salvar os valores no contexto
      setAllocatedFunds(debitoValue, value[0])
    }
  }

  // Calcular porcentagens para exibição
  const debitoPercentage = totalDebit > 0 ? Math.round((debitoValue / totalDebit) * 100) : 0
  const creditoPercentage = totalCredit > 0 ? Math.round((creditoValue / totalCredit) * 100) : 0
  const totalPercentage = totalAvailable > 0 ? Math.round((totalForMonth / totalAvailable) * 100) : 0
  const safePercentageCalc = totalAvailable > 0 ? Math.round((totalSafe / totalAvailable) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Card Líquido */}
      <Card className="border rounded-lg overflow-hidden">
        <div className="p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-blue-500">Líquido</h2>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-2xl font-bold text-blue-500">R$ {totalAvailable.toFixed(2).replace(".", ",")}</span>
            <span className="text-sm text-blue-500">
              R$ {debitoValue.toFixed(2)} / R$ {creditoValue.toFixed(2)}
            </span>
          </div>
        </div>

        <div className="border-t p-4">
          <div className="text-center mb-4">
            <div className="text-gray-600">Para este Mês:</div>
            <div className="font-bold">
              R$ {totalForMonth.toFixed(2).replace(".", ",")} | {totalPercentage}%
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-green-500">Débito: R$ {debitoValue.toFixed(2)}</span>
              <span className="text-blue-500">Crédito: R$ {creditoValue.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-center mb-4">
            <div className="text-gray-600">Reserva para este Mês:</div>
            <div className="font-bold">
              R$ {totalSafe.toFixed(2).replace(".", ",")} | {safePercentageCalc}%
            </div>
            <div className="flex justify-between text-sm mt-1">
              <span className="text-green-500">Débito: R$ {(totalDebit - debitoValue).toFixed(2)}</span>
              <span className="text-blue-500">Crédito: R$ {(totalCredit - creditoValue).toFixed(2)}</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="flex items-center gap-1">
                  <Wallet className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">Débito</span>
                </div>
                <span className="text-gray-600">R$ {debitoValue.toFixed(2).replace(".", ",")}</span>
                <span className="text-gray-600">R$ {totalDebit.toFixed(2).replace(".", ",")}</span>
              </div>
              <Slider
                value={[debitoValue]}
                max={totalDebit}
                step={1}
                onValueChange={handleDebitoSliderChange}
                disabled={totalDebit <= 0}
              />
              <div className="text-center text-sm text-gray-500">
                Débito disponível ({debitoPercentage}% selecionado)
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="flex items-center gap-1">
                  <CreditCard className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-600">Crédito</span>
                </div>
                <span className="text-gray-600">R$ {creditoValue.toFixed(2).replace(".", ",")}</span>
                <span className="text-gray-600">R$ {totalCredit.toFixed(2).replace(".", ",")}</span>
              </div>
              <Slider
                value={[creditoValue]}
                max={totalCredit}
                step={1}
                onValueChange={handleCreditoSliderChange}
                disabled={totalCredit <= 0}
              />
              <div className="text-center text-sm text-gray-500">
                Crédito disponível ({creditoPercentage}% selecionado)
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Saldo Disponível em débito:</span>
              <span className="font-bold text-green-500">
                {debitoPercentage}% (R$ {debitoValue.toFixed(2).replace(".", ",")})
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Saldo Disponível em crédito:</span>
              <span className="font-bold text-blue-500">
                {creditoPercentage}% (R$ {creditoValue.toFixed(2).replace(".", ",")})
              </span>
            </div>
            <div className="flex justify-between mt-2 pt-2 border-t">
              <span className="text-gray-600 font-medium">Total disponível:</span>
              <span className="font-bold text-xl text-blue-500">
                {totalPercentage}% (R$ {totalForMonth.toFixed(2).replace(".", ",")})
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Cards de Resumo */}
      <TableSummaryCard
        title="Ganhos"
        type="ganhos"
        entries={ganhosEntries}
        total={ganhosTotal}
        showConfigButton={true}
        showCheckboxes={true}
      />

      <TableSummaryCard
        title="Custos Fixos"
        type="custo-fixo"
        entries={custoFixoEntries}
        total={custoFixoTotal}
        percentage={custoFixoPercentage}
        showConfigButton={true}
      />

      <TableSummaryCard
        title="Custos Variados"
        type="custo-variado"
        entries={custoVariadoEntries}
        total={custoVariadoTotal}
        percentage={custoVariadoPercentage}
        showConfigButton={true}
      />

      <ParcelaDashboardCard
        title="Parcelas"
        type="parcela"
        entries={parcelaEntries}
        total={parcelaTotal}
        percentage={parcelaPercentage}
        showConfigButton={true}
      />

      <TableSummaryCard
        title="Gastos"
        type="gastos"
        entries={gastosEntries}
        total={gastosTotal}
        percentage={gastosPercentage}
        showPercentage={false}
        showConfigButton={true}
      />
    </div>
  )
}

"use client"

import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useState, useEffect } from "react"
import { useFinance } from "@/lib/finance-context"
import { CreditCard, Wallet } from "lucide-react"
import Link from "next/link"

interface LiquidoCardProps {
  liquidoTotal: number
  debitoAmount: number
  creditoAmount: number
  monthlyBudget: number
  monthlyPercentage: number
  safeBudget: number
  safePercentage: number
}

export function LiquidoCard({
  liquidoTotal,
  debitoAmount,
  creditoAmount,
  monthlyBudget,
  monthlyPercentage,
  safeBudget,
  safePercentage,
}: LiquidoCardProps) {
  const { bankAccounts, getAvailableFunds, getAllocatedFunds, setAllocatedFunds } = useFinance()
  const { totalDebit, totalCredit, totalAvailable } = getAvailableFunds()

  const [debitoValue, setDebitoValue] = useState(0)
  const [creditoValue, setCreditoValue] = useState(0)
  const [totalForMonth, setTotalForMonth] = useState(0)
  const [totalSafe, setTotalSafe] = useState(0)

  // Atualizar valores quando as entradas ou contas bancárias mudarem
  useEffect(() => {
    // Obter valores atualizados
    const { totalDebit, totalCredit } = getAvailableFunds()

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
  }, [totalDebit, totalCredit, getAllocatedFunds, setAllocatedFunds, bankAccounts])

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

  // Calcular valores de débito e crédito para este mês e reserva
  const debitoForMonth = debitoValue
  const creditoForMonth = creditoValue
  const debitoSafe = totalDebit - debitoValue
  const creditoSafe = totalCredit - creditoValue

  return (
    <Card className="border rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-blue-500">Líquido</h2>
          <Link href="/accounts" className="text-sm text-blue-500 underline">
            Gerenciar Contas
          </Link>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-blue-500">R$ {totalForMonth.toFixed(2).replace(".", ",")}</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Wallet className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-500">R$ {debitoValue.toFixed(2).replace(".", ",")}</span>
            </div>
            <span className="text-sm text-gray-400">/</span>
            <div className="flex items-center gap-1">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-blue-500">R$ {creditoValue.toFixed(2).replace(".", ",")}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t p-4">
        <div className="text-center mb-4">
          <div className="text-gray-600">Para este Mês:</div>
          <div className="font-bold flex justify-between px-4">
            <span className="flex items-center gap-1">
              <Wallet className="h-4 w-4 text-green-500" />
              <span className="text-green-500">R$ {debitoForMonth.toFixed(2).replace(".", ",")}</span>
            </span>
            <span className="flex items-center gap-1">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <span className="text-blue-500">R$ {creditoForMonth.toFixed(2).replace(".", ",")}</span>
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Total: R$ {totalForMonth.toFixed(2).replace(".", ",")} | {totalPercentage}%
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-gray-600">Reserva para este Mês:</div>
          <div className="font-bold flex justify-between px-4">
            <span className="flex items-center gap-1">
              <Wallet className="h-4 w-4 text-green-500" />
              <span className="text-green-500">R$ {debitoSafe.toFixed(2).replace(".", ",")}</span>
            </span>
            <span className="flex items-center gap-1">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <span className="text-blue-500">R$ {creditoSafe.toFixed(2).replace(".", ",")}</span>
            </span>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            Total: R$ {totalSafe.toFixed(2).replace(".", ",")} | {safePercentageCalc}%
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
            <div className="text-center text-sm text-gray-500">Débito disponível ({debitoPercentage}% selecionado)</div>
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
            <span className="flex items-center gap-1">
              <Wallet className="h-4 w-4 text-green-500" />
              <span className="text-gray-600">Débito Disponível:</span>
            </span>
            <span className="font-bold text-green-500">
              {debitoPercentage}% (R$ {debitoValue.toFixed(2).replace(".", ",")})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="flex items-center gap-1">
              <CreditCard className="h-4 w-4 text-blue-500" />
              <span className="text-gray-600">Crédito Disponível:</span>
            </span>
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
  )
}

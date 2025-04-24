"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { useState } from "react"
import { useFinance } from "@/lib/finance-context"

interface NetAmountCardProps {
  debitoAmount: number
  creditoAmount: number
}

export function NetAmountCard({ debitoAmount, creditoAmount }: NetAmountCardProps) {
  const { getSpendingAllocation, setSpendingAllocation } = useFinance()
  const allocation = getSpendingAllocation()

  const [debitoPercentage, setDebitoPercentage] = useState(allocation.debito)

  const handleSliderChange = (value: number[]) => {
    if (value.length > 0) {
      const debitoValue = value[0]
      setDebitoPercentage(debitoValue)
      setSpendingAllocation({
        debito: debitoValue,
        credito: 100 - debitoValue,
      })
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Valor Líquido</CardTitle>
        <CardDescription>Saldo disponível após despesas</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Débito</p>
            <p className="text-xl font-bold text-green-500">R${debitoAmount.toFixed(2)}</p>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Crédito</p>
            <p className="text-xl font-bold text-blue-500">R${creditoAmount.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Alocação de Gastos</span>
            <span>
              {debitoPercentage}% / {100 - debitoPercentage}%
            </span>
          </div>
          <Slider defaultValue={[debitoPercentage]} max={100} step={1} onValueChange={handleSliderChange} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Débito</span>
            <span>Crédito</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

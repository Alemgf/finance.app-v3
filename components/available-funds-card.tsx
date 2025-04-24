"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFinance } from "@/lib/finance-context"
import { getDaysUntilBilling } from "@/lib/bank-account-model"
import { CreditCard, Calendar } from "lucide-react"
import Link from "next/link"

export function AvailableFundsCard() {
  const { bankAccounts, getAvailableFunds } = useFinance()
  const { totalDebit, totalCredit, totalAvailable } = getAvailableFunds()

  // Find the account with the closest billing date
  const getNextBillingAccount = () => {
    if (bankAccounts.length === 0) return null

    return (
      bankAccounts
        .filter((account) => account.type === "credit" || account.type === "both")
        .filter((account) => account.billingDay !== undefined)
        .sort((a, b) => {
          const daysA = getDaysUntilBilling(a)
          const daysB = getDaysUntilBilling(b)
          return daysA - daysB
        })[0] || null
    )
  }

  const nextBillingAccount = getNextBillingAccount()

  return (
    <Card>
      <CardHeader className="pb-2">
        <Link href="/accounts">
          <CardTitle className="flex justify-between items-center">
            <span>Fundos Disponíveis</span>
            <span className="text-sm text-blue-500 underline">Gerenciar Contas</span>
          </CardTitle>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Débito</p>
            <p className="text-xl font-bold text-green-500">R${totalDebit.toFixed(2)}</p>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Crédito</p>
            <p className="text-xl font-bold text-blue-500">R${totalCredit.toFixed(2)}</p>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-xl font-bold">R${totalAvailable.toFixed(2)}</p>
          </div>
        </div>

        {nextBillingAccount && (
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-blue-500" />
                <p className="text-sm text-muted-foreground">Próximo fechamento</p>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-medium">
                  {nextBillingAccount.name}: {getDaysUntilBilling(nextBillingAccount)} dias
                </p>
              </div>
            </div>
          </div>
        )}

        {bankAccounts.length === 0 && (
          <div className="text-center py-2 text-muted-foreground">
            Adicione suas contas bancárias para visualizar seus fundos disponíveis
          </div>
        )}
      </CardContent>
    </Card>
  )
}

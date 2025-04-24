"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useFinance } from "@/lib/finance-context"
import { calculateAvailableCredit, getDaysUntilBilling, getBillingCyclePeriod } from "@/lib/bank-account-model"
import Link from "next/link"

export function AccountSummary() {
  const { bankAccounts, getAvailableFunds } = useFinance()
  const { totalDebit, totalCredit, totalAvailable } = getAvailableFunds()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resumo das Contas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Débito Total</p>
            <p className="text-xl font-bold text-green-500">R$ {totalDebit.toFixed(2)}</p>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Crédito Total</p>
            <p className="text-xl font-bold text-blue-500">R$ {totalCredit.toFixed(2)}</p>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Total Disponível</p>
            <p className="text-xl font-bold">R$ {totalAvailable.toFixed(2)}</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Detalhes das Contas</h3>

          {bankAccounts.map((account) => (
            <div key={account.id} className="border p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{account.icon}</span>
                <Link href={`/accounts/${account.id}`}>
                  <h4 className="text-lg font-semibold hover:text-blue-500">{account.name}</h4>
                </Link>
              </div>

              <div className="space-y-2">
                {(account.type === "debit" || account.type === "both") && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Saldo em Débito:</span>
                    <span className="font-medium">R$ {(account.debitBalance || 0).toFixed(2)}</span>
                  </div>
                )}

                {(account.type === "credit" || account.type === "both") && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Limite de Crédito:</span>
                      <span className="font-medium">R$ {(account.creditLimit || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Crédito Utilizado:</span>
                      <span className="font-medium">R$ {(account.creditUsed || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Crédito Disponível:</span>
                      <span className="font-medium text-blue-500">
                        R$ {calculateAvailableCredit(account).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ciclo de Faturamento:</span>
                      <span className="font-medium">{getBillingCyclePeriod(account)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dias até o Fechamento:</span>
                      <span className="font-medium">{getDaysUntilBilling(account)} dias</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

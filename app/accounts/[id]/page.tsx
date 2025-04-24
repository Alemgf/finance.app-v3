"use client"

import { useParams, useRouter } from "next/navigation"
import { useFinance } from "@/lib/finance-context"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { BankAccountTransactions } from "@/components/bank-account-transactions"
import { BottomMenu } from "@/components/bottom-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { calculateAvailableCredit, getDaysUntilBilling, getBillingCyclePeriod } from "@/lib/bank-account-model"

export default function BankAccountDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { getBankAccountById } = useFinance()

  const accountId = params.id as string
  const account = getBankAccountById(accountId)

  if (!account) {
    return (
      <div className="container max-w-md mx-auto p-4">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold mb-4">Conta não encontrada</h1>
          <Button onClick={() => router.push("/accounts")}>Voltar para Contas</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto p-4 pb-20 space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-muted-foreground p-0"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-2xl font-bold">Detalhes da Conta</h1>
        <div className="w-8"></div> {/* Spacer for alignment */}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-3xl">{account.icon}</span>
            <span>{account.name}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {(account.type === "debit" || account.type === "both") && (
              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Saldo em Débito</p>
                <p className="text-xl font-bold text-green-500">R$ {(account.debitBalance || 0).toFixed(2)}</p>
              </div>
            )}

            {(account.type === "credit" || account.type === "both") && (
              <>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Limite de Crédito</p>
                  <p className="text-xl font-bold">R$ {(account.creditLimit || 0).toFixed(2)}</p>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Crédito Utilizado</p>
                  <p className="text-xl font-bold text-red-500">R$ {(account.creditUsed || 0).toFixed(2)}</p>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Crédito Disponível</p>
                  <p className="text-xl font-bold text-blue-500">R$ {calculateAvailableCredit(account).toFixed(2)}</p>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Ciclo de Faturamento</p>
                  <p className="text-lg font-medium">{getBillingCyclePeriod(account)}</p>
                </div>

                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Dias até Fechamento</p>
                  <p className="text-lg font-medium">{getDaysUntilBilling(account)} dias</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <BankAccountTransactions accountId={accountId} />

      <BottomMenu />
    </div>
  )
}

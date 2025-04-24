"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"
import { BottomMenu } from "@/components/bottom-menu"
import { useFinance } from "@/lib/finance-context"
import { toast } from "@/components/ui/use-toast"
import { calculateAvailableCredit } from "@/lib/bank-account-model"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AccountsTab } from "@/components/accounts-tab"
import { TablesTab } from "@/components/tables-tab"

export default function Accounts() {
  const router = useRouter()
  const { bankAccounts, addEntry, getEntriesByType, removeEntry, syncEntriesToLiquido } = useFinance()
  const [activeTab, setActiveTab] = useState("tables")

  // Função para sincronizar todas as contas bancárias com entradas de ganhos
  const syncAllBankAccounts = () => {
    const today = new Date()
    const entries = getEntriesByType("ganhos")

    // Remover todas as entradas antigas relacionadas a contas bancárias
    entries.forEach((entry) => {
      if (entry.categories.includes("saldo-conta") || entry.categories.includes("credito-disponivel")) {
        removeEntry(entry.id)
      }
    })

    // Criar novas entradas para cada conta bancária
    bankAccounts.forEach((account) => {
      // Se a conta tem saldo de débito, criar entrada
      if ((account.type === "debit" || account.type === "both") && account.debitBalance && account.debitBalance > 0) {
        addEntry({
          description: `Saldo em Conta: ${account.name}`,
          amount: account.debitBalance,
          date: today,
          categories: ["saldo-conta"],
          isPaid: true,
          isFixed: false,
          location: `Saldo em débito da conta ${account.name}`,
          type: "ganhos",
          paymentType: "debito",
          isValidated: true,
          bankAccountId: account.id,
        })
      }

      // Se a conta tem crédito disponível, criar entrada
      if ((account.type === "credit" || account.type === "both") && account.creditLimit && account.creditLimit > 0) {
        const creditAvailable = calculateAvailableCredit(account)

        if (creditAvailable > 0) {
          addEntry({
            description: `Crédito Disponível: ${account.name}`,
            amount: creditAvailable,
            date: today,
            categories: ["credito-disponivel"],
            isPaid: true,
            isFixed: false,
            location: `Crédito disponível da conta ${account.name}`,
            type: "ganhos",
            paymentType: "credito",
            isValidated: true,
            bankAccountId: account.id,
          })
        }
      }
    })

    // Sincronizar com o card Liquido
    syncEntriesToLiquido()

    toast({
      title: "Contas sincronizadas",
      description: "Todas as contas foram sincronizadas com as entradas de ganhos",
    })
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
        <h1 className="text-2xl font-bold">Contas Bancárias</h1>
        <Button variant="outline" className="text-blue-500 border-blue-500" onClick={syncAllBankAccounts}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Sincronizar
        </Button>
      </div>

      <Tabs defaultValue="tables" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="tables">Tabelas</TabsTrigger>
          <TabsTrigger value="accounts">Contas</TabsTrigger>
        </TabsList>

        <TabsContent value="tables" className="mt-4">
          <TablesTab />
        </TabsContent>

        <TabsContent value="accounts" className="mt-4">
          <AccountsTab />
        </TabsContent>
      </Tabs>

      <BottomMenu />
    </div>
  )
}

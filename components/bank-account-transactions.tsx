"use client"

import { useState } from "react"
import { useFinance } from "@/lib/finance-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CreditCard, Wallet, Edit, Trash } from "lucide-react"
import { BubbleCheckbox } from "@/components/bubble-checkbox"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

interface BankAccountTransactionsProps {
  accountId: string
}

export function BankAccountTransactions({ accountId }: BankAccountTransactionsProps) {
  const { entries, toggleEntryValidation, removeEntry, getBankAccountById } = useFinance()
  const [activeTab, setActiveTab] = useState<"all" | "income" | "expense">("all")

  // Obter a conta bancária
  const account = getBankAccountById(accountId)

  if (!account) {
    return <div className="text-center py-4 text-muted-foreground">Conta não encontrada</div>
  }

  // Filtrar transações associadas a esta conta
  const accountTransactions = entries.filter((entry) => entry.bankAccountId === accountId)

  // Filtrar com base na tab ativa
  const filteredTransactions = accountTransactions.filter((entry) => {
    if (activeTab === "all") return true
    if (activeTab === "income") return entry.type === "ganhos"
    return entry.type !== "ganhos"
  })

  // Ordenar por data (mais recentes primeiro)
  const sortedTransactions = [...filteredTransactions].sort((a, b) => b.date.getTime() - a.date.getTime())

  const handleToggleValidation = (id: string) => {
    toggleEntryValidation(id)
    toast({
      title: "Status atualizado",
      description: "O status de validação foi atualizado com sucesso",
    })
  }

  const handleRemoveEntry = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
      removeEntry(id)
      toast({
        title: "Transação removida",
        description: "A transação foi removida com sucesso",
      })
    }
  }

  // Calcular totais
  const totalIncome = accountTransactions
    .filter((entry) => entry.type === "ganhos" && entry.isValidated)
    .reduce((sum, entry) => sum + entry.amount, 0)

  const totalExpense = accountTransactions
    .filter((entry) => entry.type !== "ganhos" && entry.isValidated)
    .reduce((sum, entry) => sum + entry.amount, 0)

  const balance = totalIncome - totalExpense

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-2xl">{account.icon}</span>
          <span>Transações: {account.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Entradas</p>
            <p className="text-xl font-bold text-green-500">R$ {totalIncome.toFixed(2)}</p>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Saídas</p>
            <p className="text-xl font-bold text-red-500">R$ {totalExpense.toFixed(2)}</p>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">Saldo</p>
            <p className={`text-xl font-bold ${balance >= 0 ? "text-green-500" : "text-red-500"}`}>
              R$ {balance.toFixed(2)}
            </p>
          </div>
        </div>

        <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as "all" | "income" | "expense")}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="income">Entradas</TabsTrigger>
            <TabsTrigger value="expense">Saídas</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {renderTransactions(sortedTransactions)}
          </TabsContent>

          <TabsContent value="income" className="space-y-4 mt-4">
            {renderTransactions(sortedTransactions)}
          </TabsContent>

          <TabsContent value="expense" className="space-y-4 mt-4">
            {renderTransactions(sortedTransactions)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )

  function renderTransactions(transactions: typeof entries) {
    if (transactions.length === 0) {
      return <div className="text-center py-4 text-muted-foreground">Nenhuma transação encontrada</div>
    }

    return transactions.map((transaction) => (
      <Card key={transaction.id} className={!transaction.isValidated ? "opacity-50" : ""}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <BubbleCheckbox
                id={`validate-${transaction.id}`}
                checked={transaction.isValidated}
                onCheckedChange={() => handleToggleValidation(transaction.id)}
                size="md"
              />
              <div>
                <h3 className="font-medium">{transaction.description}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>{transaction.date.toLocaleDateString("pt-BR")}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className={`font-medium ${transaction.type === "ganhos" ? "text-green-500" : "text-red-500"}`}>
                {transaction.type === "ganhos" ? "+" : "-"}R$ {transaction.amount.toFixed(2)}
              </span>
              <div className="flex items-center gap-1 text-sm">
                {transaction.paymentType === "debito" ? (
                  <Wallet className="h-3 w-3 text-muted-foreground" />
                ) : (
                  <CreditCard className="h-3 w-3 text-muted-foreground" />
                )}
                <span className="text-muted-foreground">
                  {transaction.paymentType === "debito" ? "Débito" : "Crédito"}
                </span>
              </div>
            </div>
          </div>

          {transaction.location && (
            <div className="mt-2 text-sm">
              <p className="text-muted-foreground">Local/Detalhes:</p>
              <p>{transaction.location}</p>
            </div>
          )}

          <div className="flex justify-between items-center mt-3">
            <Badge variant="outline">
              {transaction.type === "ganhos"
                ? "Ganho"
                : transaction.type === "custo-fixo"
                  ? "Custo Fixo"
                  : transaction.type === "custo-variado"
                    ? "Custo Variado"
                    : transaction.type === "parcela"
                      ? "Parcela"
                      : "Gasto"}
            </Badge>

            <div className="flex gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/expenses/edit/${transaction.id}`}>
                  <Edit className="h-4 w-4 text-blue-500" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleRemoveEntry(transaction.id)}>
                <Trash className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    ))
  }
}

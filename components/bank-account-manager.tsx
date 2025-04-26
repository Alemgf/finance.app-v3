"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useFinance } from "@/lib/finance-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Trash, Plus, CreditCard, Wallet, PlusCircle, MinusCircle, ChevronDown, ChevronUp } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import {
  type BankAccount,
  calculateAvailableCredit,
  getDaysUntilBilling,
  getBillingCyclePeriod,
} from "@/lib/bank-account-model"
import Link from "next/link"

export function BankAccountManager() {
  const {
    bankAccounts,
    addBankAccount,
    updateBankAccount,
    removeBankAccount,
    getAvailableFunds,
    recalculateAllBankAccountBalances,
    addEntry,
    getEntriesByType,
    removeEntry,
    entries,
    syncEntriesToLiquido,
  } = useFinance()
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null)

  // Form state
  const [formData, setFormData] = useState<Omit<BankAccount, "id">>({
    name: "",
    type: "both",
    debitBalance: 0,
    creditLimit: 0,
    creditUsed: 0,
    billingDay: 1,
    paymentDay: 10,
    icon: "💳",
  })

  // Estados para controlar a visibilidade dos campos de ajuste
  const [showDebitAdjustment, setShowDebitAdjustment] = useState(false)
  const [showCreditAdjustment, setShowCreditAdjustment] = useState(false)
  const [showCreditUsedAdjustment, setShowCreditUsedAdjustment] = useState(false)

  // Novo estado para ajuste de saldo
  const [balanceAdjustment, setBalanceAdjustment] = useState({
    debit: 0,
    credit: 0,
    creditUsed: 0,
  })

  // Refs para os inputs de valor monetário
  const debitBalanceInputRef = useRef<HTMLInputElement>(null)
  const creditLimitInputRef = useRef<HTMLInputElement>(null)
  const creditUsedInputRef = useRef<HTMLInputElement>(null)
  const editDebitBalanceInputRef = useRef<HTMLInputElement>(null)
  const editCreditLimitInputRef = useRef<HTMLInputElement>(null)
  const editCreditUsedInputRef = useRef<HTMLInputElement>(null)

  // Função para formatar valores monetários (apenas para exibição)
  const formatCurrency = (value: string | number) => {
    // Se for número, converter para string
    const stringValue = typeof value === "number" ? value.toString() : value

    // Remove caracteres não numéricos
    const numericValue = stringValue.replace(/\D/g, "")

    // Converte para número e divide por 100 para obter o valor em reais
    const floatValue = Number.parseInt(numericValue || "0", 10) / 100

    // Formata como moeda brasileira
    return floatValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Manipular entrada de valor monetário
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    // Tratamento especial para campos monetários
    if (["debitBalance", "creditLimit", "creditUsed"].includes(name)) {
      // Remove caracteres não numéricos
      const numericValue = value.replace(/\D/g, "")

      // Armazena o valor numérico
      setFormData({
        ...formData,
        [name]: numericValue ? Number.parseInt(numericValue, 10) / 100 : 0,
      })

      // Atualiza o valor exibido no input
      e.target.value = numericValue ? formatCurrency(numericValue) : ""
    }
    // Tratamento para campos de dia (apenas números inteiros)
    else if (["billingDay", "paymentDay"].includes(name)) {
      setFormData({
        ...formData,
        [name]: Number.parseInt(value) || 0,
      })
    }
    // Campos de texto
    else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  // Manipular entrada de ajuste de saldo
  const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement>, type: "debit" | "credit" | "creditUsed") => {
    const value = e.target.value
    const numericValue = value.replace(/\D/g, "")
    const amount = numericValue ? Number.parseInt(numericValue, 10) / 100 : 0

    setBalanceAdjustment({
      ...balanceAdjustment,
      [type]: amount,
    })

    // Atualiza o valor exibido no input
    e.target.value = numericValue ? formatCurrency(numericValue) : ""
  }

  // Aplicar ajuste ao saldo
  const applyAdjustment = (type: "debit" | "credit" | "creditUsed", operation: "add" | "subtract") => {
    const amount = balanceAdjustment[type]
    if (!amount) return

    // Determinar o campo a ser atualizado
    const fieldMap = {
      debit: "debitBalance",
      credit: "creditLimit",
      creditUsed: "creditUsed",
    }

    const field = fieldMap[type]
    const currentValue = (formData[field as keyof typeof formData] as number) || 0

    // Calcular o novo valor
    const newValue = operation === "add" ? currentValue + amount : Math.max(0, currentValue - amount)

    // Atualizar o formData
    setFormData({
      ...formData,
      [field]: newValue,
    })

    // Atualizar o valor exibido no input correspondente
    const inputRefMap = {
      debit: isEditDialogOpen ? editDebitBalanceInputRef : debitBalanceInputRef,
      credit: isEditDialogOpen ? editCreditLimitInputRef : creditLimitInputRef,
      creditUsed: isEditDialogOpen ? editCreditUsedInputRef : creditUsedInputRef,
    }

    const inputRef = inputRefMap[type]
    if (inputRef.current) {
      const value = Math.round(newValue * 100).toString()
      inputRef.current.value = formatCurrency(value)
    }

    // Resetar o ajuste
    setBalanceAdjustment({
      ...balanceAdjustment,
      [type]: 0,
    })

    // Limpar o campo de ajuste
    const adjustmentInput = document.getElementById(
      `${isEditDialogOpen ? "edit-" : ""}adjustment-${type}`,
    ) as HTMLInputElement
    if (adjustmentInput) {
      adjustmentInput.value = ""
    }
  }

  // Preencher os campos monetários com valores formatados ao abrir o diálogo de edição
  useEffect(() => {
    if (isEditDialogOpen && selectedAccount) {
      // Formatar os valores monetários para exibição
      if (editDebitBalanceInputRef.current && selectedAccount.debitBalance) {
        const value = Math.round(selectedAccount.debitBalance * 100).toString()
        editDebitBalanceInputRef.current.value = formatCurrency(value)
      }

      if (editCreditLimitInputRef.current && selectedAccount.creditLimit) {
        const value = Math.round(selectedAccount.creditLimit * 100).toString()
        editCreditLimitInputRef.current.value = formatCurrency(value)
      }

      if (editCreditUsedInputRef.current && selectedAccount.creditUsed) {
        const value = Math.round(selectedAccount.creditUsed * 100).toString()
        editCreditUsedInputRef.current.value = formatCurrency(value)
      }
    }
  }, [isEditDialogOpen, selectedAccount])

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  // Função para sincronizar conta bancária com entradas
  const syncBankAccountWithEntries = (account: BankAccount) => {
    const today = new Date()

    // Verificar se já existem entradas para esta conta
    const existingEntries = {
      debitBalance: entries.find(
        (entry) =>
          entry.bankAccountId === account.id &&
          entry.categories.includes("saldo-conta") &&
          entry.paymentType === "debito",
      ),
      creditLimit: entries.find(
        (entry) =>
          entry.bankAccountId === account.id &&
          entry.categories.includes("credito-disponivel") &&
          entry.paymentType === "credito",
      ),
      creditUsed: entries.find(
        (entry) =>
          entry.bankAccountId === account.id &&
          entry.categories.includes("credito") &&
          entry.type === "custo-variado" &&
          entry.paymentType === "credito",
      ),
    }

    // Se a conta tem saldo de débito, atualizar ou criar entrada de ganho em débito
    if ((account.type === "debit" || account.type === "both") && account.debitBalance && account.debitBalance > 0) {
      if (existingEntries.debitBalance) {
        // Atualizar entrada existente
        const updatedEntry = {
          ...existingEntries.debitBalance,
          amount: account.debitBalance,
          date: today,
        }

        // Remover a entrada antiga
        removeEntry(existingEntries.debitBalance.id)

        // Adicionar a entrada atualizada
        addEntry({
          description: updatedEntry.description,
          amount: updatedEntry.amount,
          date: updatedEntry.date,
          categories: updatedEntry.categories,
          isPaid: updatedEntry.isPaid,
          isFixed: updatedEntry.isFixed,
          location: updatedEntry.location,
          type: updatedEntry.type,
          paymentType: updatedEntry.paymentType,
          isValidated: updatedEntry.isValidated,
          bankAccountId: updatedEntry.bankAccountId,
          bank: updatedEntry.bank,
        })
      } else {
        // Criar nova entrada
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
    } else if (existingEntries.debitBalance) {
      // Se não tem mais saldo de débito, remover a entrada existente
      removeEntry(existingEntries.debitBalance.id)
    }

    // Se a conta tem limite de crédito, atualizar ou criar entrada de ganho em crédito
    if ((account.type === "credit" || account.type === "both") && account.creditLimit && account.creditLimit > 0) {
      if (existingEntries.creditLimit) {
        // Atualizar entrada existente
        const updatedEntry = {
          ...existingEntries.creditLimit,
          amount: account.creditLimit,
          date: today,
        }

        // Remover a entrada antiga
        removeEntry(existingEntries.creditLimit.id)

        // Adicionar a entrada atualizada
        addEntry({
          description: updatedEntry.description,
          amount: updatedEntry.amount,
          date: updatedEntry.date,
          categories: updatedEntry.categories,
          isPaid: updatedEntry.isPaid,
          isFixed: updatedEntry.isFixed,
          location: updatedEntry.location,
          type: updatedEntry.type,
          paymentType: updatedEntry.paymentType,
          isValidated: updatedEntry.isValidated,
          bankAccountId: updatedEntry.bankAccountId,
          bank: updatedEntry.bank,
        })
      } else {
        // Criar nova entrada
        addEntry({
          description: `Crédito Disponível: ${account.name}`,
          amount: account.creditLimit,
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
    } else if (existingEntries.creditLimit) {
      // Se não tem mais limite de crédito, remover a entrada existente
      removeEntry(existingEntries.creditLimit.id)
    }

    // Se a conta tem crédito utilizado, atualizar ou criar entrada de custo variado em crédito
    if ((account.type === "credit" || account.type === "both") && account.creditUsed && account.creditUsed > 0) {
      if (existingEntries.creditUsed) {
        // Atualizar entrada existente
        const updatedEntry = {
          ...existingEntries.creditUsed,
          amount: account.creditUsed,
          date: today,
        }

        // Remover a entrada antiga
        removeEntry(existingEntries.creditUsed.id)

        // Adicionar a entrada atualizada
        addEntry({
          description: updatedEntry.description,
          amount: updatedEntry.amount,
          date: updatedEntry.date,
          categories: updatedEntry.categories,
          isPaid: updatedEntry.isPaid,
          isFixed: updatedEntry.isFixed,
          location: updatedEntry.location,
          type: updatedEntry.type,
          paymentType: updatedEntry.paymentType,
          isValidated: updatedEntry.isValidated,
          bankAccountId: updatedEntry.bankAccountId,
          bank: updatedEntry.bank,
        })
      } else {
        // Criar nova entrada
        addEntry({
          description: `Crédito Utilizado: ${account.name}`,
          amount: account.creditUsed,
          date: today,
          categories: ["credito"],
          isPaid: true,
          isFixed: false,
          location: `Crédito já utilizado na conta ${account.name}`,
          type: "custo-variado",
          paymentType: "credito",
          isValidated: true,
          bankAccountId: account.id,
        })
      }
    } else if (existingEntries.creditUsed) {
      // Se não tem mais crédito utilizado, remover a entrada existente
      removeEntry(existingEntries.creditUsed.id)
    }

    // Sincronizar com o card Líquido
    setTimeout(() => syncEntriesToLiquido(), 0)
  }

  const handleAddAccount = () => {
    // Validate form
    if (!formData.name) {
      toast({
        title: "Erro",
        description: "O nome da conta é obrigatório",
        variant: "destructive",
      })
      return
    }

    // Add account
    const newAccount = {
      ...formData,
      id: Math.random().toString(36).substring(2, 9),
    }

    addBankAccount(formData)

    // Sincronizar com entradas
    syncBankAccountWithEntries(newAccount)

    // Reset form and close dialog
    setFormData({
      name: "",
      type: "both",
      debitBalance: 0,
      creditLimit: 0,
      creditUsed: 0,
      billingDay: 1,
      paymentDay: 10,
      icon: "💳",
    })
    setIsAddDialogOpen(false)

    toast({
      title: "Conta adicionada",
      description: `A conta ${formData.name} foi adicionada com sucesso`,
    })
  }

  const handleEditAccount = () => {
    if (!selectedAccount) return

    // Validate form
    if (!formData.name) {
      toast({
        title: "Erro",
        description: "O nome da conta é obrigatório",
        variant: "destructive",
      })
      return
    }

    // Update account
    updateBankAccount(selectedAccount.id, formData)

    // Sincronizar com entradas
    syncBankAccountWithEntries({ ...selectedAccount, ...formData })

    // Reset form and close dialog
    setSelectedAccount(null)
    setIsEditDialogOpen(false)

    toast({
      title: "Conta atualizada",
      description: `A conta ${formData.name} foi atualizada com sucesso`,
    })
  }

  const handleDeleteAccount = (id: string, name: string) => {
    if (window.confirm(`Tem certeza que deseja excluir a conta ${name}?`)) {
      removeBankAccount(id)

      // Remover entradas associadas a esta conta
      const allEntries = [...getEntriesByType("ganhos"), ...getEntriesByType("custo-variado")]
      allEntries.forEach((entry) => {
        if (entry.bankAccountId === id) {
          removeEntry(entry.id)
        }
      })

      toast({
        title: "Conta removida",
        description: `A conta ${name} foi removida com sucesso`,
      })
    }
  }

  const openEditDialog = (account: BankAccount) => {
    setSelectedAccount(account)
    setFormData({
      name: account.name,
      type: account.type,
      debitBalance: account.debitBalance || 0,
      creditLimit: account.creditLimit || 0,
      creditUsed: account.creditUsed || 0,
      billingDay: account.billingDay || 1,
      paymentDay: account.paymentDay || 10,
      icon: account.icon || "💳",
    })
    setIsEditDialogOpen(true)
  }

  // Calculate totals
  const { totalDebit, totalCredit, totalAvailable } = getAvailableFunds()

  // No setIsAddDialogOpen(false):
  const handleCloseAddDialog = () => {
    setFormData({
      name: "",
      type: "both",
      debitBalance: 0,
      creditLimit: 0,
      creditUsed: 0,
      billingDay: 1,
      paymentDay: 10,
      icon: "💳",
    })
    setShowDebitAdjustment(false)
    setShowCreditAdjustment(false)
    setShowCreditUsedAdjustment(false)
    setIsAddDialogOpen(false)
  }

  // No setIsEditDialogOpen(false):
  const handleCloseEditDialog = () => {
    setSelectedAccount(null)
    setShowDebitAdjustment(false)
    setShowCreditAdjustment(false)
    setShowCreditUsedAdjustment(false)
    setIsEditDialogOpen(false)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Contas Bancárias</CardTitle>
            <div className="flex flex-wrap w-full sm:w-auto gap-2">
              <Button
                onClick={() => {
                  // Sincronizar todas as contas com entradas
                  bankAccounts.forEach((account) => {
                    syncBankAccountWithEntries(account)
                  })

                  toast({
                    title: "Contas sincronizadas",
                    description: "As contas foram sincronizadas com sucesso",
                  })
                }}
                variant="outline"
                className="text-blue-500 border-blue-500 flex-1 sm:flex-none"
                size="sm"
              >
                <svg
                  className="h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
                </svg>
                Sincronizar
              </Button>
              <Button
                onClick={() => setIsAddDialogOpen(true)}
                className="bg-blue-500 hover:bg-blue-600 flex-1 sm:flex-none"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" /> Adicionar Conta
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Saldo em Débito</p>
              <p className="text-xl font-bold text-green-500">R$ {totalDebit.toFixed(2)}</p>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Crédito Disponível</p>
              <p className="text-xl font-bold text-blue-500">R$ {totalCredit.toFixed(2)}</p>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Disponível</p>
              <p className="text-xl font-bold">R$ {totalAvailable.toFixed(2)}</p>
            </div>
          </div>

          {bankAccounts.length > 0 ? (
            <div className="space-y-4">
              {bankAccounts.map((account) => (
                <Card key={account.id} className="border-2 border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{account.icon || "💳"}</div>
                        <div>
                          <Link href={`/accounts/${account.id}`}>
                            <h3 className="text-lg font-semibold hover:text-blue-500">{account.name}</h3>
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {account.type === "debit"
                              ? "Débito"
                              : account.type === "credit"
                                ? "Crédito"
                                : "Débito e Crédito"}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(account)}>
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteAccount(account.id, account.name)}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <Tabs defaultValue="summary" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="summary">Resumo</TabsTrigger>
                        <TabsTrigger value="details">Detalhes</TabsTrigger>
                      </TabsList>

                      <TabsContent value="summary" className="pt-4">
                        <div className="grid grid-cols-2 gap-4">
                          {(account.type === "debit" || account.type === "both") && (
                            <div className="bg-muted p-3 rounded-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <Wallet className="h-4 w-4 text-green-500" />
                                <p className="text-sm text-muted-foreground">Saldo em Conta</p>
                              </div>
                              <p className="text-lg font-bold text-green-500">
                                R$ {(account.debitBalance || 0).toFixed(2)}
                              </p>
                            </div>
                          )}

                          {(account.type === "credit" || account.type === "both") && (
                            <>
                              <div className="bg-muted p-3 rounded-lg">
                                <div className="flex items-center gap-2 mb-1">
                                  <CreditCard className="h-4 w-4 text-blue-500" />
                                  <p className="text-sm text-muted-foreground">Crédito Disponível</p>
                                </div>
                                <p className="text-lg font-bold text-blue-500">
                                  R$ {calculateAvailableCredit(account).toFixed(2)}
                                </p>
                              </div>

                              <div className="bg-muted p-3 rounded-lg col-span-2">
                                <div className="flex justify-between items-center mb-1">
                                  <p className="text-sm text-muted-foreground">Ciclo de Faturamento</p>
                                  <p className="text-sm font-medium">{getBillingCyclePeriod(account)}</p>
                                </div>
                                <div className="flex justify-between items-center">
                                  <p className="text-sm text-muted-foreground">Dias até o fechamento</p>
                                  <p className="text-sm font-medium">{getDaysUntilBilling(account)} dias</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value="details" className="pt-4">
                        <div className="space-y-3">
                          {(account.type === "credit" || account.type === "both") && (
                            <>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Limite de Crédito</span>
                                <span className="font-medium">R$ {(account.creditLimit || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Crédito Utilizado</span>
                                <span className="font-medium">R$ {(account.creditUsed || 0).toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Dia de Fechamento</span>
                                <span className="font-medium">{account.billingDay}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-muted-foreground">Dia de Pagamento</span>
                                <span className="font-medium">{account.paymentDay}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">Nenhuma conta bancária configurada</div>
          )}
        </CardContent>
      </Card>

      {/* Add Account Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Adicionar Conta Bancária</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon" className="text-right">
                Ícone
              </Label>
              <Input
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                className="col-span-3 text-2xl text-center"
                maxLength={2}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Tipo
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger id="type" className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">Débito</SelectItem>
                  <SelectItem value="credit">Crédito</SelectItem>
                  <SelectItem value="both">Débito e Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.type === "debit" || formData.type === "both") && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="debitBalance" className="text-right">
                    Saldo em Conta
                  </Label>
                  <Input
                    id="debitBalance"
                    name="debitBalance"
                    placeholder="R$ 0,00"
                    onChange={handleInputChange}
                    className="col-span-3"
                    ref={debitBalanceInputRef}
                  />
                </div>

                {/* Botão para mostrar/esconder o ajuste de saldo */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right"></div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="col-span-3 flex justify-between items-center text-blue-500"
                    onClick={() => setShowDebitAdjustment(!showDebitAdjustment)}
                  >
                    Ajustar Saldo
                    {showDebitAdjustment ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Componente para ajuste de saldo em débito (condicional) */}
                {showDebitAdjustment && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="adjustment-debit" className="text-right">
                      Valor do Ajuste
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="adjustment-debit"
                        placeholder="R$ 0,00"
                        onChange={(e) => handleAdjustmentChange(e, "debit")}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => applyAdjustment("debit", "add")}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => applyAdjustment("debit", "subtract")}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {(formData.type === "credit" || formData.type === "both") && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="creditLimit" className="text-right">
                    Limite de Crédito
                  </Label>
                  <Input
                    id="creditLimit"
                    name="creditLimit"
                    placeholder="R$ 0,00"
                    onChange={handleInputChange}
                    className="col-span-3"
                    ref={creditLimitInputRef}
                  />
                </div>

                {/* Botão para mostrar/esconder o ajuste de limite */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right"></div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="col-span-3 flex justify-between items-center text-blue-500"
                    onClick={() => setShowCreditAdjustment(!showCreditAdjustment)}
                  >
                    Ajustar Limite
                    {showCreditAdjustment ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Componente para ajuste de limite de crédito (condicional) */}
                {showCreditAdjustment && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="adjustment-credit" className="text-right">
                      Valor do Ajuste
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="adjustment-credit"
                        placeholder="R$ 0,00"
                        onChange={(e) => handleAdjustmentChange(e, "credit")}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => applyAdjustment("credit", "add")}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => applyAdjustment("credit", "subtract")}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="creditUsed" className="text-right">
                    Crédito Utilizado
                  </Label>
                  <Input
                    id="creditUsed"
                    name="creditUsed"
                    placeholder="R$ 0,00"
                    onChange={handleInputChange}
                    className="col-span-3"
                    ref={creditUsedInputRef}
                  />
                </div>

                {/* Botão para mostrar/esconder o ajuste de crédito utilizado */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right"></div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="col-span-3 flex justify-between items-center text-blue-500"
                    onClick={() => setShowCreditUsedAdjustment(!showCreditUsedAdjustment)}
                  >
                    Ajustar Utilizado
                    {showCreditUsedAdjustment ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Componente para ajuste de crédito utilizado (condicional) */}
                {showCreditUsedAdjustment && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="adjustment-creditUsed" className="text-right">
                      Valor do Ajuste
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="adjustment-creditUsed"
                        placeholder="R$ 0,00"
                        onChange={(e) => handleAdjustmentChange(e, "creditUsed")}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => applyAdjustment("creditUsed", "add")}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => applyAdjustment("creditUsed", "subtract")}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="billingDay" className="text-right">
                    Dia de Fechamento
                  </Label>
                  <Input
                    id="billingDay"
                    name="billingDay"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.billingDay}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="paymentDay" className="text-right">
                    Dia de Pagamento
                  </Label>
                  <Input
                    id="paymentDay"
                    name="paymentDay"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.paymentDay}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-2 pb-2">
            <Button type="button" variant="outline" onClick={handleCloseAddDialog}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleAddAccount} className="bg-blue-500 hover:bg-blue-600">
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Conta Bancária</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-icon" className="text-right">
                Ícone
              </Label>
              <Input
                id="edit-icon"
                name="icon"
                value={formData.icon}
                onChange={handleInputChange}
                className="col-span-3 text-2xl text-center"
                maxLength={2}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-name" className="text-right">
                Nome
              </Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="edit-type" className="text-right">
                Tipo
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger id="edit-type" className="col-span-3">
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debit">Débito</SelectItem>
                  <SelectItem value="credit">Crédito</SelectItem>
                  <SelectItem value="both">Débito e Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(formData.type === "debit" || formData.type === "both") && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-debitBalance" className="text-right">
                    Saldo em Conta
                  </Label>
                  <Input
                    id="edit-debitBalance"
                    name="debitBalance"
                    placeholder="R$ 0,00"
                    onChange={handleInputChange}
                    className="col-span-3"
                    ref={editDebitBalanceInputRef}
                  />
                </div>

                {/* Botão para mostrar/esconder o ajuste de saldo */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right"></div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="col-span-3 flex justify-between items-center text-blue-500"
                    onClick={() => setShowDebitAdjustment(!showDebitAdjustment)}
                  >
                    Ajustar Saldo
                    {showDebitAdjustment ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Componente para ajuste de saldo em débito (condicional) */}
                {showDebitAdjustment && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-adjustment-debit" className="text-right">
                      Valor do Ajuste
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="edit-adjustment-debit"
                        placeholder="R$ 0,00"
                        onChange={(e) => handleAdjustmentChange(e, "debit")}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => applyAdjustment("debit", "add")}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => applyAdjustment("debit", "subtract")}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {(formData.type === "credit" || formData.type === "both") && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-creditLimit" className="text-right">
                    Limite de Crédito
                  </Label>
                  <Input
                    id="edit-creditLimit"
                    name="creditLimit"
                    placeholder="R$ 0,00"
                    onChange={handleInputChange}
                    className="col-span-3"
                    ref={editCreditLimitInputRef}
                  />
                </div>

                {/* Botão para mostrar/esconder o ajuste de limite */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right"></div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="col-span-3 flex justify-between items-center text-blue-500"
                    onClick={() => setShowCreditAdjustment(!showCreditAdjustment)}
                  >
                    Ajustar Limite
                    {showCreditAdjustment ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Componente para ajuste de limite de crédito (condicional) */}
                {showCreditAdjustment && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-adjustment-credit" className="text-right">
                      Valor do Ajuste
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="edit-adjustment-credit"
                        placeholder="R$ 0,00"
                        onChange={(e) => handleAdjustmentChange(e, "credit")}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => applyAdjustment("credit", "add")}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => applyAdjustment("credit", "subtract")}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-creditUsed" className="text-right">
                    Crédito Utilizado
                  </Label>
                  <Input
                    id="edit-creditUsed"
                    name="creditUsed"
                    placeholder="R$ 0,00"
                    onChange={handleInputChange}
                    className="col-span-3"
                    ref={editCreditUsedInputRef}
                  />
                </div>

                {/* Botão para mostrar/esconder o ajuste de crédito utilizado */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <div className="text-right"></div>
                  <Button
                    type="button"
                    variant="ghost"
                    className="col-span-3 flex justify-between items-center text-blue-500"
                    onClick={() => setShowCreditUsedAdjustment(!showCreditUsedAdjustment)}
                  >
                    Ajustar Utilizado
                    {showCreditUsedAdjustment ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </div>

                {/* Componente para ajuste de crédito utilizado (condicional) */}
                {showCreditUsedAdjustment && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="edit-adjustment-creditUsed" className="text-right">
                      Valor do Ajuste
                    </Label>
                    <div className="col-span-3 flex items-center gap-2">
                      <Input
                        id="edit-adjustment-creditUsed"
                        placeholder="R$ 0,00"
                        onChange={(e) => handleAdjustmentChange(e, "creditUsed")}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => applyAdjustment("creditUsed", "add")}
                        className="bg-green-500 hover:bg-green-600"
                      >
                        <PlusCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        onClick={() => applyAdjustment("creditUsed", "subtract")}
                        className="bg-red-500 hover:bg-red-600"
                      >
                        <MinusCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-billingDay" className="text-right">
                    Dia de Fechamento
                  </Label>
                  <Input
                    id="edit-billingDay"
                    name="billingDay"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.billingDay}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-paymentDay" className="text-right">
                    Dia de Pagamento
                  </Label>
                  <Input
                    id="edit-paymentDay"
                    name="paymentDay"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.paymentDay}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="sticky bottom-0 bg-background pt-2 pb-2">
            <Button type="button" variant="outline" onClick={handleCloseEditDialog}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleEditAccount} className="bg-blue-500 hover:bg-blue-600">
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

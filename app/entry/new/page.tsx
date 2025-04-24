"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useFinance } from "@/lib/finance-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ArrowLeft, PlusCircle, MinusCircle } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NewEntryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addEntry, syncEntriesToLiquido, getSubcategories, bankAccounts, getBankAccountById } = useFinance()

  // Obter o tipo da URL, se disponível
  const typeFromUrl = searchParams.get("type") as "ganhos" | "custo-fixo" | "custo-variado" | "parcela" | null

  // Estado para os campos do formulário
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [categories, setCategories] = useState<string[]>([])
  const [isPaid, setIsPaid] = useState("true") // String para o select
  const [isFixed, setIsFixed] = useState("false") // String para o select
  const [location, setLocation] = useState("")
  const [type, setType] = useState<"ganhos" | "custo-fixo" | "custo-variado" | "parcela">(typeFromUrl || "ganhos")
  const [paymentType, setPaymentType] = useState<"debito" | "credito">("debito")
  const [bankAccountId, setBankAccountId] = useState("")
  const [selectedAccount, setSelectedAccount] = useState<any>(null)

  // Novo estado para ajuste de saldo
  const [balanceAdjustment, setBalanceAdjustment] = useState(0)

  // Data atual formatada para o input de data
  const today = new Date()
  const formattedDate = today.toISOString().split("T")[0] // Formato YYYY-MM-DD
  const [date, setDate] = useState(formattedDate)

  // Atualizar título e campos com base no tipo
  const [title, setTitle] = useState("Nova Entrada")
  const [sourceLabel, setSourceLabel] = useState("Categorias")
  const [sourceOptions, setSourceOptions] = useState(getSubcategories(type))

  // Atualizar a conta bancária selecionada quando o ID mudar
  useEffect(() => {
    if (bankAccountId && bankAccountId !== "none") {
      const account = getBankAccountById(bankAccountId)
      setSelectedAccount(account)
    } else {
      setSelectedAccount(null)
    }
  }, [bankAccountId, getBankAccountById])

  useEffect(() => {
    // Atualizar título e campos com base no tipo
    switch (type) {
      case "ganhos":
        setTitle("Novo Ganho")
        setSourceLabel("Ganhei em")
        setSourceOptions(getSubcategories("ganhos"))
        setIsFixed("false")
        break
      case "custo-fixo":
        setTitle("Novo Custo Fixo")
        setSourceLabel("Gastei em")
        setSourceOptions(getSubcategories("custo-fixo"))
        setIsFixed("true")
        break
      case "custo-variado":
        setTitle("Novo Custo Variado")
        setSourceLabel("Gastei em")
        setSourceOptions(getSubcategories("custo-variado"))
        setIsFixed("false")
        break
      case "parcela":
        setTitle("Nova Parcela")
        setSourceLabel("Gastei em")
        setSourceOptions(getSubcategories("parcela"))
        setIsFixed("false")
        break
    }
  }, [type, getSubcategories])

  // Formatar valor como moeda brasileira
  const formatCurrency = (value: string) => {
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, "")

    // Converte para número e divide por 100 para obter o valor em reais
    const floatValue = Number.parseInt(numericValue || "0", 10) / 100

    // Formata como moeda brasileira
    return floatValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Manipular entrada de valor monetário
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove caracteres não numéricos
    const numericValue = e.target.value.replace(/\D/g, "")

    // Armazena o valor numérico
    setAmount(numericValue ? (Number.parseInt(numericValue, 10) / 100).toString() : "")

    // Atualiza o valor exibido no input
    e.target.value = numericValue ? formatCurrency(numericValue) : ""
  }

  // Manipular entrada de ajuste de saldo
  const handleAdjustmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, "")
    const adjustmentValue = numericValue ? Number.parseInt(numericValue, 10) / 100 : 0
    setBalanceAdjustment(adjustmentValue)
    // Atualiza o valor exibido no input
    e.target.value = numericValue ? formatCurrency(numericValue) : ""
  }

  // Aplicar ajuste ao saldo da conta
  const applyAdjustment = (operation: "add" | "subtract") => {
    if (!balanceAdjustment) return

    // Calcular o novo valor
    const currentAmount = amount ? Number.parseFloat(amount) : 0
    const newAmount =
      operation === "add" ? currentAmount + balanceAdjustment : Math.max(0, currentAmount - balanceAdjustment)

    // Atualizar o valor do formulário
    setAmount(newAmount.toString())

    // Atualizar o valor exibido no input
    const amountInput = document.getElementById("amount") as HTMLInputElement
    if (amountInput) {
      amountInput.value = formatCurrency((newAmount * 100).toString())
    }

    // Resetar o ajuste
    setBalanceAdjustment(0)

    // Limpar o campo de ajuste
    const adjustmentInput = document.getElementById("adjustment") as HTMLInputElement
    if (adjustmentInput) {
      adjustmentInput.value = ""
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!amount || !description) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    // Adicionar a nova entrada
    addEntry({
      description,
      amount: Number.parseFloat(amount),
      date: new Date(date),
      categories: categories,
      isPaid: isPaid === "true",
      isFixed: isFixed === "true",
      location,
      type,
      paymentType,
      isValidated: true,
      bankAccountId: bankAccountId !== "none" ? bankAccountId : undefined,
    })

    // Sincronizar com o card Liquido
    syncEntriesToLiquido()

    // Mostrar mensagem de sucesso
    toast({
      title: "Entrada registrada",
      description: `R$${Number.parseFloat(amount).toFixed(2)} - ${description}`,
    })

    // Redirecionar de volta para a página de tabelas
    router.push(`/tables/${type}`)
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <header className="bg-blue-500 text-white p-4 flex items-center mb-4">
        <Button variant="ghost" className="mr-4 p-0 hover:bg-transparent" onClick={() => router.back()}>
          <ArrowLeft className="h-6 w-6 text-white" />
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </header>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 pt-6">
            {/* Tipo de entrada */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select
                value={type}
                onValueChange={(value: "ganhos" | "custo-fixo" | "custo-variado" | "parcela") => setType(value)}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ganhos">Ganhos</SelectItem>
                  <SelectItem value="custo-fixo">Custo Fixo</SelectItem>
                  <SelectItem value="custo-variado">Custo Variado</SelectItem>
                  <SelectItem value="parcela">Parcela</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input id="amount" placeholder="R$ 0,00" onChange={handleAmountChange} required />
            </div>

            {/* Novo componente para ajuste de saldo */}
            <div className="space-y-2">
              <Label htmlFor="adjustment">Ajustar Valor</Label>
              <div className="flex items-center gap-2">
                <Input id="adjustment" placeholder="R$ 0,00" onChange={handleAdjustmentChange} className="flex-1" />
                <Button
                  type="button"
                  size="icon"
                  onClick={() => applyAdjustment("add")}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  onClick={() => applyAdjustment("subtract")}
                  className="bg-red-500 hover:bg-red-600"
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Débito/Crédito como Tabs */}
            <div className="space-y-2">
              <Label>Débito/Crédito</Label>
              <Tabs
                value={paymentType}
                onValueChange={(value: "debito" | "credito") => setPaymentType(value)}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="debito">Débito</TabsTrigger>
                  <TabsTrigger value="credito">Crédito</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Conta Bancária */}
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Conta Bancária</Label>
              <Select value={bankAccountId} onValueChange={setBankAccountId}>
                <SelectTrigger id="bankAccount">
                  <SelectValue placeholder="Selecione a conta bancária..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {bankAccounts
                    .filter(
                      (account) =>
                        (paymentType === "debito" && (account.type === "debit" || account.type === "both")) ||
                        (paymentType === "credito" && (account.type === "credit" || account.type === "both")),
                    )
                    .map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.icon} {account.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Descrição (movido para cima do campo O que ou Aonde?) */}
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Input
                id="description"
                placeholder="Ex: Salário mensal"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Ganhei/Gastei em (Categorias) */}
            <div className="space-y-2">
              <Label htmlFor="categories">{sourceLabel}</Label>
              <MultiSelect
                options={sourceOptions}
                selected={categories}
                onChange={setCategories}
                placeholder={`Selecione ${sourceLabel.toLowerCase()}...`}
              />
            </div>

            {/* O que ou Aonde? */}
            <div className="space-y-2">
              <Label htmlFor="location">O que ou Aonde?</Label>
              <Textarea
                id="location"
                placeholder="Descreva o local ou detalhes adicionais..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            {/* Fixo/Variado */}
            <div className="space-y-2">
              <Label htmlFor="isFixed">Fixo/Variado</Label>
              <Select value={isFixed} onValueChange={setIsFixed}>
                <SelectTrigger id="isFixed">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Fixo</SelectItem>
                  <SelectItem value="false">Variado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
              Salvar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useFinance } from "@/lib/finance-context"
import { toast } from "@/components/ui/use-toast"
import { SlideToConfirm } from "@/components/slide-to-confirm"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function EditExpensePage() {
  const params = useParams()
  const router = useRouter()
  const { entries, getSubcategories, removeEntry, addEntry, bankAccounts, syncEntriesToLiquido } = useFinance()

  const id = params.id as string
  const entry = entries.find((e) => e.id === id)

  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<string>("")
  const [subcategories, setSubcategories] = useState<string[]>([])
  const [isPaid, setIsPaid] = useState("true")
  const [isFixed, setIsFixed] = useState("false")
  const [location, setLocation] = useState("")
  const [paymentType, setPaymentType] = useState<"debito" | "credito">("debito")
  const [date, setDate] = useState("")
  const [bankAccountId, setBankAccountId] = useState<string>("")

  const [availableSubcategories, setAvailableSubcategories] = useState<{ label: string; value: string }[]>([])

  // Filtrar contas bancárias com base no tipo de pagamento
  const filteredBankAccounts = bankAccounts.filter((account) => {
    if (paymentType === "debito") {
      return account.type === "debit" || account.type === "both"
    } else {
      return account.type === "credit" || account.type === "both"
    }
  })

  // Carregar dados da entrada
  useEffect(() => {
    if (entry) {
      setAmount(entry.amount.toString())
      setDescription(entry.description)
      setCategory(entry.type)
      setSubcategories(entry.categories)
      setIsPaid(entry.isPaid ? "true" : "false")
      setIsFixed(entry.isFixed ? "true" : "false")
      setLocation(entry.location)
      setPaymentType(entry.paymentType)
      setDate(entry.date.toISOString().split("T")[0])
      setBankAccountId(entry.bankAccountId || "")
    } else {
      // Redirecionar se a entrada não for encontrada
      router.push("/")
    }
  }, [entry, router])

  // Carregar subcategorias e bancos
  useEffect(() => {
    if (category) {
      const subcats = getSubcategories(category as "ganhos" | "custo-fixo" | "custo-variado" | "parcela")
      setAvailableSubcategories(subcats)
    }
  }, [category, getSubcategories])

  const handleSubmit = (e: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    if (!amount || !description || !category) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      })
      return
    }

    // Remover entrada antiga
    removeEntry(id)

    // Adicionar entrada atualizada
    addEntry({
      description,
      amount: Number.parseFloat(amount),
      date: new Date(date),
      categories: subcategories,
      isPaid: isPaid === "true",
      isFixed: isFixed === "true",
      location,
      type: category as "ganhos" | "custo-fixo" | "custo-variado" | "parcela",
      paymentType,
      bankAccountId: bankAccountId && bankAccountId !== "none" ? bankAccountId : undefined,
      isValidated: entry?.isValidated || false,
    })

    // Sincronizar com o card Liquido
    syncEntriesToLiquido()

    toast({
      title: "Entrada atualizada",
      description: `R$${Number.parseFloat(amount).toFixed(2)} - ${description}`,
    })

    // Redirecionar de volta
    if (category === "ganhos") {
      router.push("/ganhos")
    } else {
      router.push("/")
    }
  }

  // Formatar valor como moeda brasileira
  const formatCurrency = (value: string) => {
    // Remove caracteres não numéricos
    const numericValue = value.replace(/\D/g, "")

    // Converte para número e divide por 100 para obter o valor em reais
    const floatValue = Number.parseInt(numericValue) / 100

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
    setAmount(numericValue ? (Number.parseInt(numericValue) / 100).toString() : "")

    // Atualiza o valor exibido no input
    e.target.value = numericValue ? formatCurrency(numericValue) : ""
  }

  // Manipular seleção de subcategorias
  const handleSubcategoryChange = (subcategory: string) => {
    setSubcategories((prev) => {
      if (prev.includes(subcategory)) {
        return prev.filter((item) => item !== subcategory)
      } else {
        return [...prev, subcategory]
      }
    })
  }

  // Título dinâmico baseado no tipo
  const getTitle = () => {
    switch (category) {
      case "ganhos":
        return "Editar Ganho"
      case "custo-fixo":
        return "Editar Custo Fixo"
      case "custo-variado":
        return "Editar Custo Variado"
      case "parcela":
        return "Editar Parcela"
      default:
        return "Editar Entrada"
    }
  }

  if (!entry) {
    return <div>Carregando...</div>
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <header className="bg-blue-500 text-white p-4 -mx-4 -mt-4 mb-4 flex items-center">
        <Link href={category === "ganhos" ? "/ganhos" : "/"} className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">{getTitle()}</h1>
      </header>

      <Card>
        <form onSubmit={(e) => e.preventDefault()}>
          <CardContent className="space-y-4 pt-6">
            {/* Data */}
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            {/* Subcategorias */}
            <div className="space-y-2">
              <Label htmlFor="subcategory">Subcategoria</Label>
              <Select
                value={subcategories.length > 0 ? subcategories[0] : ""}
                onValueChange={(value) => setSubcategories([value])}
              >
                <SelectTrigger id="subcategory">
                  <SelectValue placeholder="Selecione a subcategoria..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSubcategories.length > 0 ? (
                    availableSubcategories.map((subcat) => (
                      <SelectItem key={subcat.value} value={subcat.value || "default"}>
                        {subcat.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none">Nenhuma subcategoria configurada</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                placeholder="R$ 0,00"
                defaultValue={formatCurrency(amount)}
                onChange={handleAmountChange}
                required
              />
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

            {/* Removed Banco field */}

            {/* Conta Bancária - agora para todos os tipos de transação */}
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Conta Bancária</Label>
              <Select value={bankAccountId} onValueChange={setBankAccountId}>
                <SelectTrigger id="bankAccount">
                  <SelectValue placeholder="Selecione a conta..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma conta</SelectItem>
                  {filteredBankAccounts.map((account) => (
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
                placeholder={category === "ganhos" ? "Ex: Salário mensal" : "Ex: Compra no mercado"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
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
          <CardFooter className="flex flex-col space-y-4">
            {/* Slider para confirmar */}
            <div className="w-full">
              <SlideToConfirm
                text="slide to unlock"
                subText={`Atualizar: R$${amount ? Number.parseFloat(amount).toFixed(2) : "0.00"}`}
                onConfirm={handleSubmit}
                disabled={!amount || !description || !category}
                showConfetti={false}
              />
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

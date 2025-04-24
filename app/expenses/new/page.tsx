"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useFinance } from "@/lib/finance-context"
import { toast } from "@/components/ui/use-toast"
import { SlideToConfirm } from "@/components/slide-to-confirm"
import { themeConfig } from "@/lib/theme-config"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Opções de categorias
const categoryOptions = [
  { label: "Ganhos", value: "ganhos" },
  { label: "Custo Fixo", value: "custo-fixo" },
  { label: "Custo Variado", value: "custo-variado" },
  { label: "Parcela", value: "parcela" },
  { label: "Gastos", value: "gastos" },
]

export default function NewExpensePage() {
  const router = useRouter()
  // Add bankAccounts to the useFinance hook
  const { addEntry, getSubcategories, bankAccounts } = useFinance()
  const searchParams = useSearchParams()

  // Obter o tipo da URL, se disponível
  const typeFromUrl = searchParams.get("type") as
    | "ganhos"
    | "custo-fixo"
    | "custo-variado"
    | "parcela"
    | "gastos"
    | null

  // Estado para os campos do formulário
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<string>(typeFromUrl || "gastos")
  const [subcategory, setSubcategory] = useState<string>("")
  const [isFixed, setIsFixed] = useState("false")
  const [location, setLocation] = useState("")
  const [paymentType, setPaymentType] = useState<"debito" | "credito">("debito")
  // Removed bank state
  // Add bankAccountId state
  const [bankAccountId, setBankAccountId] = useState<string>("")

  // Data atual formatada para o input de data
  const today = new Date()
  const formattedDate = today.toISOString().split("T")[0] // Formato YYYY-MM-DD
  const [date, setDate] = useState(formattedDate)

  // Obter subcategorias disponíveis
  const [availableSubcategories, setAvailableSubcategories] = useState<{ label: string; value: string }[]>([])

  // Filtrar contas bancárias com base no tipo de pagamento
  const filteredBankAccounts = bankAccounts.filter((account) => {
    if (paymentType === "debito") {
      return account.type === "debit" || account.type === "both"
    } else {
      return account.type === "credit" || account.type === "both"
    }
  })

  useEffect(() => {
    // Atualizar subcategorias disponíveis com base na categoria selecionada
    const subcats = getSubcategories(category as "ganhos" | "custo-fixo" | "custo-variado" | "parcela" | "gastos")
    setAvailableSubcategories(subcats)
    setSubcategory("")

    // Atualizar isFixed com base na categoria
    if (category === "custo-fixo") {
      setIsFixed("true")
    } else if (category === "custo-variado" || category === "gastos") {
      setIsFixed("false")
    }
  }, [category, getSubcategories])

  const handleSubmit = (e: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    if (!amount || !description || !category || !subcategory) {
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
      categories: [subcategory],
      isPaid: true,
      isFixed: isFixed === "true",
      location,
      type: category as "ganhos" | "custo-fixo" | "custo-variado" | "parcela" | "gastos",
      paymentType,
      bankAccountId: bankAccountId && bankAccountId !== "none" ? bankAccountId : undefined,
      isValidated: true, // Todos os ganhos adicionados manualmente começam validados
    })

    // Mostrar mensagem de sucesso
    toast({
      title: category === "ganhos" ? "Ganho registrado" : "Gasto registrado",
      description: `R$${Number.parseFloat(amount).toFixed(2)} - ${description}`,
    })

    // Redirecionar de volta para a página apropriada
    if (category === "ganhos") {
      router.push("/config/ganhos")
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

  // Título dinâmico baseado no tipo
  const getTitle = () => {
    switch (category) {
      case "ganhos":
        return "Registrar Ganho"
      case "custo-fixo":
        return "Registrar Custo Fixo"
      case "custo-variado":
        return "Registrar Custo Variado"
      case "parcela":
        return "Registrar Parcela"
      case "gastos":
        return "Registrar Gasto"
      default:
        return "Registrar Entrada"
    }
  }

  return (
    <div className="container max-w-md mx-auto p-4 pb-20" style={{ backgroundColor: themeConfig.colors.background }}>
      <header
        className="p-4 -mx-4 -mt-4 mb-4 flex items-center"
        style={{ backgroundColor: themeConfig.colors.cardBackgroundDark }}
      >
        <Link href="/" className="mr-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
            <ArrowLeft className="h-5 w-5 text-white" />
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: themeConfig.typography.fontFamily }}>
          {getTitle()}
        </h1>
      </header>

      <div
        className="p-6"
        style={{
          backgroundColor: themeConfig.colors.cardBackground,
          borderRadius: themeConfig.borderRadius.medium,
          boxShadow: themeConfig.shadows.medium,
        }}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Data */}
            <div className="space-y-2">
              <Label
                htmlFor="date"
                className="block text-sm font-medium"
                style={{ color: themeConfig.colors.textSecondary }}
              >
                Data
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                style={{
                  borderColor: themeConfig.colors.border,
                  borderRadius: themeConfig.borderRadius.small,
                }}
              />
            </div>

            {/* Tipo */}
            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="block text-sm font-medium"
                style={{ color: themeConfig.colors.textSecondary }}
              >
                Tipo
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger
                  id="category"
                  style={{
                    borderColor: themeConfig.colors.border,
                    borderRadius: themeConfig.borderRadius.small,
                  }}
                >
                  <SelectValue placeholder="Selecione o tipo..." />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subcategoria */}
            <div className="space-y-2">
              <Label
                htmlFor="subcategory"
                className="block text-sm font-medium"
                style={{ color: themeConfig.colors.textSecondary }}
              >
                Subcategoria
              </Label>
              <Select value={subcategory} onValueChange={setSubcategory}>
                <SelectTrigger
                  id="subcategory"
                  style={{
                    borderColor: themeConfig.colors.border,
                    borderRadius: themeConfig.borderRadius.small,
                  }}
                >
                  <SelectValue placeholder="Selecione a subcategoria..." />
                </SelectTrigger>
                <SelectContent>
                  {availableSubcategories.length > 0 ? (
                    availableSubcategories.map((subcat) => (
                      <SelectItem key={subcat.value} value={subcat.value}>
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
              <Label
                htmlFor="amount"
                className="block text-sm font-medium"
                style={{ color: themeConfig.colors.textSecondary }}
              >
                Valor
              </Label>
              <Input
                id="amount"
                placeholder="R$ 0,00"
                onChange={handleAmountChange}
                required
                style={{
                  borderColor: themeConfig.colors.border,
                  borderRadius: themeConfig.borderRadius.small,
                }}
              />
            </div>

            {/* Débito/Crédito como Tabs */}
            <div className="space-y-2">
              <Label className="block text-sm font-medium" style={{ color: themeConfig.colors.textSecondary }}>
                Débito/Crédito
              </Label>
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
              <Label
                htmlFor="bankAccount"
                className="block text-sm font-medium"
                style={{ color: themeConfig.colors.textSecondary }}
              >
                Conta Bancária
              </Label>
              <Select value={bankAccountId} onValueChange={setBankAccountId}>
                <SelectTrigger
                  id="bankAccount"
                  style={{
                    borderColor: themeConfig.colors.border,
                    borderRadius: themeConfig.borderRadius.small,
                  }}
                >
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
              <Label
                htmlFor="description"
                className="block text-sm font-medium"
                style={{ color: themeConfig.colors.textSecondary }}
              >
                Descrição
              </Label>
              <Input
                id="description"
                placeholder={category === "ganhos" ? "Ex: Salário mensal" : "Ex: Compra no mercado"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{
                  borderColor: themeConfig.colors.border,
                  borderRadius: themeConfig.borderRadius.small,
                }}
              />
            </div>

            {/* O que ou Aonde? */}
            <div className="space-y-2">
              <Label
                htmlFor="location"
                className="block text-sm font-medium"
                style={{ color: themeConfig.colors.textSecondary }}
              >
                O que ou Aonde?
              </Label>
              <Textarea
                id="location"
                placeholder="Descreva o local ou detalhes adicionais..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="min-h-[80px]"
                style={{
                  borderColor: themeConfig.colors.border,
                  borderRadius: themeConfig.borderRadius.small,
                }}
              />
            </div>

            {/* Fixo/Variado */}
            <div className="space-y-2">
              <Label
                htmlFor="isFixed"
                className="block text-sm font-medium"
                style={{ color: themeConfig.colors.textSecondary }}
              >
                Fixo/Variado
              </Label>
              <Select value={isFixed} onValueChange={setIsFixed}>
                <SelectTrigger
                  id="isFixed"
                  style={{
                    borderColor: themeConfig.colors.border,
                    borderRadius: themeConfig.borderRadius.small,
                  }}
                >
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Fixo</SelectItem>
                  <SelectItem value="false">Variado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6">
            <SlideToConfirm
              text="slide to unlock"
              subText={`${category === "ganhos" ? "Ganho" : "Gasto"}: R$${amount ? Number.parseFloat(amount).toFixed(2) : "0.00"}`}
              onConfirm={handleSubmit}
              disabled={!amount || !description || !category || !subcategory}
              showConfetti={false}
              confettiColor={themeConfig.colors.accent}
            />
          </div>
        </form>
      </div>
    </div>
  )
}

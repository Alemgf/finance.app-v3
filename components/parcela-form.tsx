"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useFinance } from "@/lib/finance-context"
import { toast } from "@/components/ui/use-toast"
import { SlideToConfirm } from "@/components/slide-to-confirm"
import { Plus, Minus } from "lucide-react"
import confetti from "canvas-confetti"

interface ParcelaFormProps {
  availableAmount: number
}

export function ParcelaForm({ availableAmount }: ParcelaFormProps) {
  const { addEntry, getSubcategories } = useFinance()

  const [totalValue, setTotalValue] = useState("")
  const [totalValueDisplay, setTotalValueDisplay] = useState("")
  const [numParcelas, setNumParcelas] = useState(1)
  const [parcelaValue, setParcelaValue] = useState(0)
  const [description, setDescription] = useState("")
  const [subcategory, setSubcategory] = useState("")
  const [subcategories, setSubcategories] = useState<{ label: string; value: string }[]>([])
  const [isFormValid, setIsFormValid] = useState(false)

  // Carregar subcategorias
  useEffect(() => {
    setSubcategories(getSubcategories("parcela"))
  }, [getSubcategories])

  // Calcular valor da parcela quando o valor total ou número de parcelas mudar
  useEffect(() => {
    if (totalValue && numParcelas > 0) {
      const total = Number.parseFloat(totalValue)
      if (!isNaN(total)) {
        setParcelaValue(total / numParcelas)
      }
    } else {
      setParcelaValue(0)
    }
  }, [totalValue, numParcelas])

  // Verificar se o formulário é válido
  useEffect(() => {
    const isTotalValid = totalValue && Number.parseFloat(totalValue) > 0
    const isParcelaValid = parcelaValue > 0 && parcelaValue <= availableAmount
    const isDescriptionValid = description.trim().length > 0
    const isSubcategoryValid = subcategory.trim().length > 0

    setIsFormValid(isTotalValid && isParcelaValid && isDescriptionValid && isSubcategoryValid)
  }, [totalValue, parcelaValue, description, subcategory, availableAmount])

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
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove caracteres não numéricos
    const numericValue = e.target.value.replace(/\D/g, "")

    // Armazena o valor numérico
    setTotalValue(numericValue ? (Number.parseInt(numericValue) / 100).toString() : "")

    // Atualiza o valor exibido no input
    const formattedValue = numericValue ? formatCurrency(numericValue) : ""
    setTotalValueDisplay(formattedValue)
    e.target.value = formattedValue
  }

  // Incrementar número de parcelas
  const incrementParcelas = () => {
    setNumParcelas((prev) => Math.min(prev + 1, 24)) // Máximo de 24 parcelas
  }

  // Decrementar número de parcelas
  const decrementParcelas = () => {
    setNumParcelas((prev) => Math.max(prev - 1, 1)) // Mínimo de 1 parcela
  }

  // Registrar parcelas
  const handleConfirm = () => {
    if (!isFormValid) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos corretamente",
        variant: "destructive",
      })
      return
    }

    const total = Number.parseFloat(totalValue)

    // Criar parcelas para os próximos meses
    const today = new Date()
    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    for (let i = 0; i < numParcelas; i++) {
      const parcelaDate = new Date(currentYear, currentMonth + i, today.getDate())

      addEntry({
        description: `${description} (${i + 1}/${numParcelas})`,
        amount: parcelaValue,
        date: parcelaDate,
        categories: [subcategory],
        isPaid: i === 0, // Apenas a primeira parcela começa como paga
        isFixed: true,
        location: `Valor total: R$${total.toFixed(2)} em ${numParcelas}x`,
        type: "parcela",
        paymentType: "credito", // Parcelas são sempre no crédito
        isValidated: i === 0, // Apenas a primeira parcela começa como validada
      })
    }

    // Limpar formulário
    setTotalValue("")
    setTotalValueDisplay("")
    setNumParcelas(1)
    setDescription("")
    setSubcategory("")

    // Resetar o campo de valor total
    const inputElement = document.getElementById("totalValue") as HTMLInputElement
    if (inputElement) {
      inputElement.value = ""
    }

    // Mostrar mensagem de sucesso
    toast({
      title: "Parcelas registradas",
      description: `${numParcelas}x de R$${parcelaValue.toFixed(2)} registradas com sucesso`,
    })

    // Disparar confetes para celebrar (agora em verde)
    confetti({
      particleCount: 200,
      spread: 100,
      origin: { y: 0.6 },
      colors: ["#22c55e", "#22c55e", "#ffffff"], // Verde
    })
  }

  // Criar texto para o slider
  const sliderText = `slide to unlock`
  const sliderSubText = `${numParcelas}x de R$${parcelaValue.toFixed(2)}`

  return (
    <Card>
      <CardHeader>
        <CardTitle>Adicionar Parcelas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Valor Total */}
          <div className="space-y-2">
            <Label htmlFor="totalValue">Valor Total</Label>
            <Input
              id="totalValue"
              placeholder="R$ 0,00"
              onChange={handleValueChange}
              value={totalValueDisplay}
              required
            />
          </div>

          {/* Número de Parcelas */}
          <div className="space-y-2">
            <Label htmlFor="numParcelas">Número de Parcelas</Label>
            <div className="flex items-center">
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center"
                onClick={decrementParcelas}
                disabled={numParcelas <= 1}
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="flex-1 mx-2">
                <Input
                  id="numParcelas"
                  type="number"
                  min="1"
                  max="24"
                  value={numParcelas}
                  onChange={(e) => setNumParcelas(Number.parseInt(e.target.value) || 1)}
                  className="text-center"
                  required
                />
              </div>
              <button
                type="button"
                className="w-10 h-10 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center"
                onClick={incrementParcelas}
                disabled={numParcelas >= 24}
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Valor da Parcela (calculado) */}
          <div className="bg-muted p-4 rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-1">Valor de cada parcela</p>
            <p className="text-2xl font-bold text-blue-500">
              {parcelaValue ? `R$ ${parcelaValue.toFixed(2)}` : "R$ 0,00"}
            </p>
            {parcelaValue > availableAmount && (
              <p className="text-xs text-red-500 mt-1">Valor excede o limite disponível para parcelas</p>
            )}
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              placeholder="Ex: Tênis Nike"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Subcategoria */}
          <div className="space-y-2">
            <Label htmlFor="subcategory">Categoria</Label>
            <Select value={subcategory} onValueChange={setSubcategory}>
              <SelectTrigger id="subcategory">
                <SelectValue placeholder="Selecione a categoria..." />
              </SelectTrigger>
              <SelectContent>
                {subcategories.map((subcat) => (
                  <SelectItem key={subcat.value} value={subcat.value}>
                    {subcat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Slider para confirmar */}
          <div className="mt-6">
            <SlideToConfirm
              text={sliderText}
              subText={sliderSubText}
              onConfirm={handleConfirm}
              disabled={!isFormValid}
              confettiColor="#22c55e" // Verde
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

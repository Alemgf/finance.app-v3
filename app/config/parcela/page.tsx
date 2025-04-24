"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFinance } from "@/lib/finance-context"
import { ParcelaForm } from "@/components/parcela-form"
import { ParcelasList } from "@/components/parcelas-list"
import { toast } from "@/components/ui/use-toast"
// Importar o BottomMenu no topo do arquivo, se ainda não estiver importado
import { BottomMenu } from "@/components/bottom-menu"

export default function ConfigParcelaPage() {
  const router = useRouter()
  const {
    getNetAmount,
    getSpendingAllocation,
    setSpendingAllocation,
    getEntriesByType,
    getSubcategories,
    addSubcategory,
    removeSubcategory,
  } = useFinance()

  const [creditoAmount, setCreditoAmount] = useState(0)
  const [maxParcelaAmount, setMaxParcelaAmount] = useState(0)
  const [parcelaPercentage, setParcelaPercentage] = useState(30) // Padrão: 30% do crédito
  const [currentParcelasTotal, setCurrentParcelasTotal] = useState(0)
  const [availableForParcelas, setAvailableForParcelas] = useState(0)
  const [newSubcategory, setNewSubcategory] = useState("")
  const [subcategories, setSubcategories] = useState<{ label: string; value: string }[]>([])

  // Obter o valor de crédito disponível e calcular valores
  useEffect(() => {
    const netAmount = getNetAmount()
    const creditoValue = netAmount.credito
    setCreditoAmount(creditoValue)

    // Calcular o valor máximo para parcelas (baseado na porcentagem)
    const maxValue = (creditoValue * parcelaPercentage) / 100
    setMaxParcelaAmount(maxValue)

    // Calcular o total atual em parcelas
    const parcelas = getEntriesByType("parcela")
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()

    // Filtrar parcelas do mês atual
    const currentMonthParcelas = parcelas.filter((parcela) => {
      const parcelaMonth = parcela.date.getMonth()
      const parcelaYear = parcela.date.getFullYear()
      return parcelaMonth === currentMonth && parcelaYear === currentYear
    })

    // Somar valores
    const total = currentMonthParcelas.reduce((sum, parcela) => sum + parcela.amount, 0)
    setCurrentParcelasTotal(total)

    // Calcular disponível para novas parcelas
    setAvailableForParcelas(Math.max(0, maxValue - total))

    // Carregar subcategorias
    setSubcategories(getSubcategories("parcela"))
  }, [getNetAmount, getEntriesByType, parcelaPercentage, getSubcategories])

  // Atualizar a porcentagem máxima para parcelas
  const handleSliderChange = (value: number[]) => {
    if (value.length > 0) {
      setParcelaPercentage(value[0])
    }
  }

  // Adicionar subcategoria
  const handleAddSubcategory = () => {
    if (!newSubcategory.trim()) {
      toast({
        title: "Erro",
        description: "O nome da subcategoria não pode estar vazio",
        variant: "destructive",
      })
      return
    }

    // Verificar se já existe uma subcategoria com esse nome
    const exists = subcategories.some((subcat) => subcat.label.toLowerCase() === newSubcategory.toLowerCase())

    if (exists) {
      toast({
        title: "Erro",
        description: "Já existe uma subcategoria com esse nome",
        variant: "destructive",
      })
      return
    }

    // Criar valor a partir do label (slug)
    const value = newSubcategory
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s]/g, "")
      .replace(/\s+/g, "-")

    // Adicionar subcategoria
    addSubcategory("parcela", { label: newSubcategory, value })

    // Limpar campo
    setNewSubcategory("")

    toast({
      title: "Sucesso",
      description: "Subcategoria adicionada com sucesso",
    })
  }

  // Remover subcategoria
  const handleRemoveSubcategory = (value: string) => {
    removeSubcategory("parcela", value)

    toast({
      title: "Sucesso",
      description: "Subcategoria removida com sucesso",
    })
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <header className="bg-blue-500 text-white p-4 -mx-4 -mt-4 mb-4 flex items-center">
        <Link href="/tables" className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">Configurar Parcelas</h1>
      </header>

      <Tabs defaultValue="parcelas" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="parcelas">Parcelas</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="parcelas" className="space-y-6 mt-4">
          {/* Card de Crédito Disponível */}
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Crédito Disponível</span>
                <span className="text-blue-500">R$ {creditoAmount.toFixed(2)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Limite para Parcelas</Label>
                  <span>{parcelaPercentage}% do crédito</span>
                </div>
                <Slider value={[parcelaPercentage]} min={0} max={100} step={5} onValueChange={handleSliderChange} />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Máximo para Parcelas</p>
                  <p className="text-xl font-bold text-blue-500">R$ {maxParcelaAmount.toFixed(2)}</p>
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm text-muted-foreground">Disponível</p>
                  <p className="text-xl font-bold text-green-500">R$ {availableForParcelas.toFixed(2)}</p>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm text-muted-foreground">Total em Parcelas (mês atual)</p>
                <p className="text-xl font-bold text-blue-500">R$ {currentParcelasTotal.toFixed(2)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Formulário de Parcelas */}
          <ParcelaForm availableAmount={availableForParcelas} />

          {/* Lista de Parcelas */}
          <ParcelasList />
        </TabsContent>

        <TabsContent value="categorias" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Subcategorias</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Nova subcategoria..."
                    value={newSubcategory}
                    onChange={(e) => setNewSubcategory(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddSubcategory} className="bg-blue-500 hover:bg-blue-600">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {subcategories.length > 0 ? (
                  subcategories.map((subcat) => (
                    <div key={subcat.value} className="flex items-center justify-between p-2 border rounded-md">
                      <span>{subcat.label}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveSubcategory(subcat.value)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">Nenhuma subcategoria configurada</div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Adicionar o BottomMenu no final do return, antes do fechamento da div principal */}
      <BottomMenu />
    </div>
  )
}

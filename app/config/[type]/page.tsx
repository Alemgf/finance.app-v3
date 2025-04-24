"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash, Edit } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFinance } from "@/lib/finance-context"
import { toast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
// Importar o BottomMenu no topo do arquivo
import { BottomMenu } from "@/components/bottom-menu"
import { themeConfig } from "@/lib/theme-config"

export default function ConfigPage() {
  const params = useParams()
  const router = useRouter()
  const type = params.type as "ganhos" | "custo-fixo" | "custo-variado" | "parcela" | "gastos"
  const { getSubcategories, addSubcategory, removeSubcategory, getEntriesByType, toggleEntryValidation, removeEntry } =
    useFinance()

  const [newSubcategory, setNewSubcategory] = useState("")
  const [activeTab, setActiveTab] = useState("entries")

  // Obter subcategorias e bancos
  const subcategories = getSubcategories(type)
  const entries = getEntriesByType(type)

  // Títulos para cada tipo
  const typeLabels = {
    ganhos: "Ganhos",
    "custo-fixo": "Custo Fixo",
    "custo-variado": "Custo Variado",
    parcela: "Parcela",
    gastos: "Gastos",
  }

  // Definir o nome da tab com base no tipo
  useEffect(() => {
    setActiveTab(type === "ganhos" ? "ganhos" : "entries")
  }, [type])

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
    addSubcategory(type, { label: newSubcategory, value })

    // Limpar campo
    setNewSubcategory("")

    toast({
      title: "Sucesso",
      description: "Subcategoria adicionada com sucesso",
    })
  }

  const handleRemoveSubcategory = (value: string) => {
    removeSubcategory(type, value)

    toast({
      title: "Sucesso",
      description: "Subcategoria removida com sucesso",
    })
  }

  const handleToggleValidation = (id: string) => {
    toggleEntryValidation(id)
    toast({
      title: "Status atualizado",
      description: "O status de validação foi atualizado com sucesso",
    })
  }

  const handleRemoveEntry = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta entrada?")) {
      removeEntry(id)
      toast({
        title: "Entrada removida",
        description: "A entrada foi removida com sucesso",
      })
    }
  }

  // Atualizar o return do componente para incluir o BottomMenu e aplicar o estilo consistente
  // Substituir o return atual por:

  return (
    <div className="container max-w-md mx-auto p-4 pb-20" style={{ backgroundColor: themeConfig.colors.background }}>
      <header
        className="p-4 -mx-4 -mt-4 mb-4 flex items-center"
        style={{ backgroundColor: themeConfig.colors.cardBackgroundDark }}
      >
        <Link href="/tables" className="mr-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
            <ArrowLeft className="h-5 w-5 text-white" />
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: themeConfig.typography.fontFamily }}>
          Configurar {typeLabels[type]}
        </h1>
      </header>

      <div
        className="p-6 mb-6"
        style={{
          backgroundColor: themeConfig.colors.cardBackground,
          borderRadius: themeConfig.borderRadius.medium,
          boxShadow: themeConfig.shadows.medium,
        }}
      >
        <Tabs defaultValue={activeTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entries">{typeLabels[type]}</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="mt-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-blue-500">{typeLabels[type]}</h2>
              <Link href={`/expenses/new?type=${type}`}>
                <Button variant="outline" className="border border-blue-500 text-blue-500 px-4">
                  ADD
                </Button>
              </Link>
            </div>
            {entries.length > 0 ? (
              entries.map((entry) => (
                <Card key={entry.id} className="mb-4">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`validate-${entry.id}`}
                          checked={entry.isValidated}
                          onCheckedChange={() => handleToggleValidation(entry.id)}
                        />
                        <h3 className="text-lg font-semibold">{entry.description}</h3>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/expenses/edit/${entry.id}`}>
                            <Edit className="h-4 w-4 text-blue-500" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveEntry(entry.id)}>
                          <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm text-gray-500 mb-2">{entry.date.toLocaleDateString("pt-BR")}</div>

                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Valor</span>
                      <span className="font-medium">R$ {entry.amount.toFixed(2).replace(".", ",")}</span>
                    </div>

                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">O que ou Aonde?</span>
                      <span>{entry.location || "-"}</span>
                    </div>

                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Status</span>
                      <Badge variant={entry.paymentType === "debito" ? "default" : "secondary"}>
                        {entry.paymentType === "debito" ? "Débito" : "Crédito"}
                      </Badge>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-600">Tipo</span>
                      <Badge variant={entry.isFixed ? "outline" : "secondary"}>
                        {entry.isFixed ? "Fixo" : "Variado"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-500">Nenhum registro encontrado</p>
            )}
          </TabsContent>

          <TabsContent value="categorias" className="mt-4 space-y-8">
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
                      style={{
                        borderColor: themeConfig.colors.border,
                        borderRadius: themeConfig.borderRadius.small,
                      }}
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
      </div>

      <BottomMenu />
    </div>
  )
}

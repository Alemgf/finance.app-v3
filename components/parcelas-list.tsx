"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useFinance } from "@/lib/finance-context"
import { toast } from "@/components/ui/use-toast"
import { Edit, Trash } from "lucide-react"
import Link from "next/link"
import { BubbleCheckbox } from "@/components/bubble-checkbox"

export function ParcelasList() {
  const { getEntriesByType, toggleEntryValidation, removeEntry } = useFinance()
  const [parcelas, setParcelas] = useState<any[]>([])
  const [groupedParcelas, setGroupedParcelas] = useState<any>({})

  // Carregar parcelas
  useEffect(() => {
    const parcelasEntries = getEntriesByType("parcela")
    setParcelas(parcelasEntries)

    // Agrupar parcelas por descrição base (sem o número da parcela)
    const grouped = parcelasEntries.reduce((acc, parcela) => {
      // Extrair a descrição base (removendo o "(X/Y)" do final)
      const baseDesc = parcela.description.replace(/\s*$$\d+\/\d+$$$/, "")

      if (!acc[baseDesc]) {
        acc[baseDesc] = []
      }

      acc[baseDesc].push(parcela)
      return acc
    }, {})

    setGroupedParcelas(grouped)
  }, [getEntriesByType])

  // Alternar validação
  const handleToggleValidation = (id: string) => {
    toggleEntryValidation(id)
    toast({
      title: "Status atualizado",
      description: "O status de validação foi atualizado com sucesso",
    })
  }

  // Remover parcela
  const handleRemoveEntry = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir esta parcela?")) {
      removeEntry(id)
      toast({
        title: "Parcela removida",
        description: "A parcela foi removida com sucesso",
      })
    }
  }

  // Remover grupo de parcelas
  const handleRemoveGroup = (baseDesc: string) => {
    if (window.confirm(`Tem certeza que deseja excluir todas as parcelas de "${baseDesc}"?`)) {
      groupedParcelas[baseDesc].forEach((parcela: any) => {
        removeEntry(parcela.id)
      })

      toast({
        title: "Parcelas removidas",
        description: `Todas as parcelas de "${baseDesc}" foram removidas com sucesso`,
      })
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parcelas Registradas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.keys(groupedParcelas).length > 0 ? (
          Object.entries(groupedParcelas).map(([baseDesc, items]: [string, any]) => (
            <div key={baseDesc} className="border rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">{baseDesc}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveGroup(baseDesc)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {items
                  .sort((a: any, b: any) => a.date.getTime() - b.date.getTime())
                  .map((parcela: any) => {
                    // Extrair o número da parcela da descrição
                    const match = parcela.description.match(/$$(\d+)\/(\d+)$$$/)
                    const parcelaNum = match ? match[1] : "?"
                    const totalParcelas = match ? match[2] : "?"

                    return (
                      <div key={parcela.id} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                          <BubbleCheckbox
                            id={`validate-${parcela.id}`}
                            checked={parcela.isValidated}
                            onCheckedChange={() => handleToggleValidation(parcela.id)}
                            size="lg"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-blue-100">
                                {parcelaNum}/{totalParcelas}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {parcela.date.toLocaleDateString("pt-BR")}
                              </span>
                            </div>
                            <p className="font-medium mt-1">R$ {parcela.amount.toFixed(2)}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/expenses/edit/${parcela.id}`}>
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleRemoveEntry(parcela.id)}>
                            <Trash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">Nenhuma parcela registrada ainda</div>
        )}
      </CardContent>
    </Card>
  )
}

"use client"
import { ArrowLeft, Edit, Trash, PieChart, Settings, Home, Plus } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useFinance } from "@/lib/finance-context"
import { toast } from "@/components/ui/use-toast"
import { BubbleCheckbox } from "@/components/bubble-checkbox"

export default function GanhosPage() {
  const { getEntriesByType, getTotalByType, toggleEntryValidation, removeEntry, getBankTotals, getSubcategories } =
    useFinance()

  // Obter entradas de ganhos
  const ganhosEntries = getEntriesByType("ganhos")

  // Obter totais por banco
  const bankTotals = getBankTotals()

  // Calcular total geral
  const totalGeral = getTotalByType("ganhos")

  const handleToggleValidation = (id: string) => {
    toggleEntryValidation(id)
    toast({
      title: "Status atualizado",
      description: "O status de validação foi atualizado com sucesso",
    })
  }

  const handleRemoveEntry = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este ganho?")) {
      removeEntry(id)
      toast({
        title: "Ganho removido",
        description: "O ganho foi removido com sucesso",
      })
    }
  }

  // Agrupar ganhos por subcategoria
  const groupGanhosBySubcategory = () => {
    const grouped: Record<
      string,
      {
        subcategory: string
        entries: typeof ganhosEntries
        total: number
      }
    > = {}

    ganhosEntries.forEach((entry) => {
      // Usar a primeira subcategoria como chave de agrupamento
      const subcatKey = entry.categories.length > 0 ? entry.categories[0] : "sem-categoria"
      const subcatLabel =
        entry.categories.length > 0
          ? getSubcategories("ganhos").find((s) => s.value === subcatKey)?.label || "Sem categoria"
          : "Sem categoria"

      if (!grouped[subcatKey]) {
        grouped[subcatKey] = {
          subcategory: subcatLabel,
          entries: [],
          total: 0,
        }
      }

      if (entry.isValidated) {
        grouped[subcatKey].total += entry.amount
      }

      grouped[subcatKey].entries.push(entry)
    })

    return Object.values(grouped)
  }

  const groupedGanhos = groupGanhosBySubcategory()

  return (
    <div className="container max-w-md mx-auto pb-20">
      <header className="bg-blue-500 text-white p-4 flex items-center">
        <Link href="/tables" className="mr-4">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-2xl font-bold">Ganhos</h1>
      </header>

      <Tabs defaultValue="ganhos" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ganhos">Ganhos</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
        </TabsList>

        <TabsContent value="ganhos" className="mt-4 p-4 space-y-4">
          <Card className="border rounded-lg overflow-hidden">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-blue-500">Ganhos</h2>
                <Link href="/expenses/new?type=ganhos">
                  <Button variant="outline" className="border border-blue-500 text-blue-500 px-4">
                    ADD
                  </Button>
                </Link>
              </div>

              {/* Resumo por banco */}
              {Object.entries(bankTotals).map(([bank, amounts]) => (
                <div key={bank} className="flex justify-between mb-2">
                  <span className="text-gray-600">{bank === "default" ? "Sem banco" : `${bank}:`}</span>
                  <div>
                    {amounts.debito > 0 && (
                      <span className="mr-4">Débito: R$ {amounts.debito.toFixed(2).replace(".", ",")}</span>
                    )}
                    {amounts.credito > 0 && <span>Crédito: R$ {amounts.credito.toFixed(2).replace(".", ",")}</span>}
                  </div>
                </div>
              ))}

              <div className="border-t my-3"></div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total:</span>
                <span className="text-xl font-bold text-blue-500">R$ {totalGeral.toFixed(2).replace(".", ",")}</span>
              </div>
            </div>
          </Card>

          {/* Lista de ganhos agrupados por subcategoria */}
          {groupedGanhos.length > 0 ? (
            groupedGanhos.map((group) => (
              <div key={group.subcategory} className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold">{group.subcategory}</h3>
                  <span className="font-bold text-blue-500">Total: R$ {group.total.toFixed(2).replace(".", ",")}</span>
                </div>

                {group.entries.map((entry) => (
                  <Card
                    key={entry.id}
                    className={`border rounded-lg overflow-hidden mb-3 ${!entry.isValidated ? "opacity-50" : ""}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <BubbleCheckbox
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

                      <div className="flex justify-between mb-2">
                        <span className="text-gray-600">Banco</span>
                        <Badge variant="outline" className="bg-blue-100">
                          {entry.bank || "Não especificado"}
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
                ))}
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">Nenhum ganho registrado ainda</div>
          )}
        </TabsContent>

        <TabsContent value="categorias" className="mt-4">
          <div className="p-4">
            <Link href="/config/ganhos">
              <Button className="w-full bg-blue-500 hover:bg-blue-600">Configurar Categorias e Bancos</Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-background">
        <div className="container max-w-md mx-auto p-4">
          <div className="flex justify-around">
            <Link href="/">
              <Button variant="ghost" className="flex flex-col items-center gap-1">
                <Home className="h-5 w-5 text-blue-500" />
                <span className="text-xs">Início</span>
              </Button>
            </Link>

            <Link href="/tables">
              <Button variant="ghost" className="flex flex-col items-center gap-1">
                <PieChart className="h-5 w-5 text-blue-500" />
                <span className="text-xs">Tabelas</span>
              </Button>
            </Link>

            <Link href="/settings">
              <Button variant="ghost" className="flex flex-col items-center gap-1">
                <Settings className="h-5 w-5 text-blue-500" />
                <span className="text-xs">Ajustes</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="fixed bottom-20 right-6">
        <Link href="/expenses/new?type=ganhos">
          <Button size="lg" className="rounded-full w-14 h-14 p-0 bg-blue-500 hover:bg-blue-600">
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

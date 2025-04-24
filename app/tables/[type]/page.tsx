"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Plus, Calendar, DollarSign, CreditCard, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useFinance } from "@/lib/finance-context"
import { useParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { BubbleCheckbox } from "@/components/bubble-checkbox"
import { toast } from "@/components/ui/use-toast"

// Mapeamento de tipos para títulos
const typeLabels = {
  ganhos: "Ganhos",
  "custo-fixo": "Custos Fixos",
  "custo-variado": "Custos Variados",
  parcela: "Parcelas",
}

export default function TableDetailPage() {
  const params = useParams()
  const type = params.type as string as "ganhos" | "custo-fixo" | "custo-variado" | "parcela"
  const { getEntriesByType, getTotalByType, toggleEntryValidation } = useFinance()

  // Obter entradas do tipo especificado
  const entries = getEntriesByType(type)

  // Obter totais
  const totalDebito = getTotalByType(type, "debito")
  const totalCredito = getTotalByType(type, "credito")
  const total = totalDebito + totalCredito

  // Título da página
  const title = typeLabels[type] || "Tabela"

  // Determinar se deve mostrar o botão de configuração especial para parcelas
  const showParcelaConfig = type === "parcela"

  const handleToggleValidation = (id: string) => {
    toggleEntryValidation(id)
    toast({
      title: "Status atualizado",
      description: "O status de validação foi atualizado com sucesso",
    })
  }

  return (
    <div className="container max-w-md mx-auto p-4 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <Link href="/tables" className="flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold">{title}</h1>
        <div className="flex gap-2">
          {showParcelaConfig && (
            <Link href="/config/parcela">
              <Button size="icon" variant="outline">
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
          )}
          <Link href={`/entry/new?type=${type}`}>
            <Button size="icon" variant="ghost">
              <Plus className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold">R${total.toFixed(2)}</p>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Débito</p>
              <p className="text-xl font-bold">R${totalDebito.toFixed(2)}</p>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Crédito</p>
              <p className="text-xl font-bold">R${totalCredito.toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <Card key={entry.id} className={!entry.isValidated ? "opacity-50" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <BubbleCheckbox
                      id={`validate-${entry.id}`}
                      checked={entry.isValidated}
                      onCheckedChange={() => handleToggleValidation(entry.id)}
                      size="md"
                    />
                    <CardTitle className="text-base">{entry.description}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={entry.paymentType === "debito" ? "default" : "secondary"}>
                      {entry.paymentType === "debito" ? "Débito" : "Crédito"}
                    </Badge>
                    <span className="font-bold">R${entry.amount.toFixed(2)}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{entry.date.toLocaleDateString("pt-BR")}</span>
                </div>

                {entry.location && (
                  <div className="text-sm">
                    <p className="text-muted-foreground">Local/Detalhes:</p>
                    <p>{entry.location}</p>
                  </div>
                )}

                {entry.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {entry.categories.map((category, index) => (
                      <Badge key={index} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span>{entry.isPaid ? "Pago" : "Não pago"}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>{entry.isFixed ? "Fixo" : "Variado"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">Nenhum registro encontrado</div>
        )}
      </div>
    </div>
  )
}

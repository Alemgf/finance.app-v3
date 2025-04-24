import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, CreditCard, Wallet } from "lucide-react"
import Link from "next/link"
import type { FinanceEntry } from "@/lib/finance-context"
import { BubbleCheckbox } from "@/components/bubble-checkbox"
import { useFinance } from "@/lib/finance-context"
import { toast } from "@/components/ui/use-toast"

interface TableSummaryCardProps {
  title: string
  type: "ganhos" | "custo-fixo" | "custo-variado" | "parcela" | "gastos"
  entries: FinanceEntry[]
  total: number
  percentage?: number
  showPercentage?: boolean
  showConfigButton?: boolean
  showCheckboxes?: boolean
}

export function TableSummaryCard({
  title,
  type,
  entries,
  total,
  percentage = 0,
  showPercentage = true,
  showConfigButton = false,
  showCheckboxes = false,
}: TableSummaryCardProps) {
  const { toggleEntryValidation, bankAccounts } = useFinance()

  // Pegar até 3 entradas para exibir
  const displayEntries = entries.slice(0, 3)

  // Determinar a cor do título com base no tipo
  const getTitleColor = () => {
    switch (type) {
      case "ganhos":
        return "text-blue-500"
      case "custo-fixo":
        return "text-blue-500"
      case "custo-variado":
        return "text-blue-500"
      case "parcela":
        return "text-blue-500"
      default:
        return "text-blue-500"
    }
  }

  const handleToggleValidation = (id: string) => {
    toggleEntryValidation(id)
    toast({
      title: "Status atualizado",
      description: "O status de validação foi atualizado com sucesso",
    })
  }

  // Função para obter o nome da conta bancária
  const getBankAccountName = (bankAccountId?: string) => {
    if (!bankAccountId) return null
    const account = bankAccounts.find((acc) => acc.id === bankAccountId)
    return account ? `${account.icon} ${account.name}` : null
  }

  return (
    <Card className="border rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-2xl font-bold ${getTitleColor()}`}>{title}</h2>
          <div className="flex gap-2">
            {showConfigButton && (
              <Link href={`/config/${type}`}>
                <Button variant="outline" className="border border-blue-500 text-blue-500 px-2">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
            )}
            <Link href={`/expenses/new?type=${type}`}>
              <Button variant="outline" className="border border-blue-500 text-blue-500 px-4">
                ADD
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-2">
          {displayEntries.map((entry) => (
            <div
              key={entry.id}
              className={`flex justify-between items-center ${!entry.isValidated ? "opacity-50" : ""}`}
            >
              {showCheckboxes && (
                <div className="mr-2">
                  <BubbleCheckbox
                    id={`validate-${entry.id}`}
                    checked={entry.isValidated}
                    onCheckedChange={() => handleToggleValidation(entry.id)}
                    size="sm"
                  />
                </div>
              )}
              <div className="flex-grow">
                <span className="text-gray-600">
                  {type === "parcela" && entry.description.includes("/") ? entry.description : `${entry.description}:`}
                </span>
                {entry.bankAccountId && (
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    {entry.paymentType === "debito" ? (
                      <Wallet className="h-3 w-3" />
                    ) : (
                      <CreditCard className="h-3 w-3" />
                    )}
                    {getBankAccountName(entry.bankAccountId)}
                  </div>
                )}
              </div>
              <span className="font-medium">
                {type === "ganhos" ? "" : "-"}
                R$ {Math.abs(entry.amount).toFixed(2).replace(".", ",")}
              </span>
            </div>
          ))}

          {entries.length === 0 && <div className="text-center text-gray-500 py-2">Nenhum registro encontrado</div>}
        </div>

        {entries.length > 0 && (
          <>
            <div className="border-t my-3"></div>

            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total:</span>
              <span className={`text-xl font-bold ${getTitleColor()}`}>
                {type === "ganhos" ? "" : ""}
                R$ {Math.abs(total).toFixed(2).replace(".", ",")}
              </span>
            </div>

            {showPercentage && (
              <div className="flex items-center justify-end mt-1">
                <svg
                  className="w-5 h-5 text-blue-500 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-blue-500 font-bold">{percentage}%</span>
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  )
}

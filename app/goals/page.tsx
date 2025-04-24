import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"

// In a real app, this would come from the database
const mockGoal = {
  id: 1,
  name: "Viagem para a praia",
  targetAmount: 2000,
  savedAmount: 850,
  startDate: new Date(2023, 5, 1),
  endDate: new Date(2023, 6, 1),
  dailyBudget: 60,
}

export default function GoalsPage() {
  const percentage = (mockGoal.savedAmount / mockGoal.targetAmount) * 100
  const remaining = mockGoal.targetAmount - mockGoal.savedAmount
  const today = new Date()
  const daysLeft = Math.ceil((mockGoal.endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  return (
    <div className="container max-w-md mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <h1 className="text-2xl font-bold">Metas</h1>
        <Link href="/goals/new">
          <Button size="icon" variant="ghost">
            <Plus className="h-5 w-5" />
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{mockGoal.name}</CardTitle>
          <CardDescription>Meta diária: R${mockGoal.dailyBudget.toFixed(2)}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span>Progresso</span>
              <span>{percentage.toFixed(0)}%</span>
            </div>
            <Progress value={percentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Economizado</p>
              <p className="text-xl font-bold">R${mockGoal.savedAmount.toFixed(2)}</p>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Faltam</p>
              <p className="text-xl font-bold">R${remaining.toFixed(2)}</p>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Dias restantes</p>
              <p className="text-xl font-bold">{daysLeft}</p>
            </div>
            <div className="bg-muted p-3 rounded-lg">
              <p className="text-sm text-muted-foreground">Data final</p>
              <p className="text-xl font-bold">{mockGoal.endDate.toLocaleDateString("pt-BR")}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useFinance } from "@/lib/finance-context"

interface GoalProgressCardProps {
  goalAmount: number
  savedAmount: number
  daysLeft: number
}

export function GoalProgressCard({ goalAmount, savedAmount, daysLeft }: GoalProgressCardProps) {
  const { getAvailableFunds } = useFinance()
  const { totalAvailable } = getAvailableFunds()

  // Use o valor disponível total como valor economizado
  const actualSavedAmount = totalAvailable

  // Calcular a porcentagem com base no valor disponível
  const percentage = (actualSavedAmount / goalAmount) * 100
  const remaining = goalAmount - actualSavedAmount

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between">
          <span>Meta de Economia</span>
          <span>R${actualSavedAmount.toFixed(2)}</span>
        </CardTitle>
        <CardDescription>de R${goalAmount.toFixed(2)}</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={percentage} className="h-2 mb-2" />
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Faltam R${remaining.toFixed(2)}</span>
          <span className="text-muted-foreground">{daysLeft} dias restantes</span>
        </div>
      </CardContent>
    </Card>
  )
}

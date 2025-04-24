"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewGoalPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [endDate, setEndDate] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // In a real app, we would save the goal to the database
    // and calculate the daily budget

    // Mock implementation
    const today = new Date()
    const targetDate = new Date(endDate)
    const daysUntilTarget = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    const dailyBudget = Number.parseFloat(targetAmount) / daysUntilTarget

    console.log({
      name,
      targetAmount: Number.parseFloat(targetAmount),
      startDate: today,
      endDate: targetDate,
      dailyBudget,
    })

    // Redirect back to goals page
    router.push("/goals")
  }

  return (
    <div className="container max-w-md mx-auto p-4">
      <div className="mb-6">
        <Link href="/goals" className="flex items-center gap-2 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova Meta</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Meta</Label>
              <Input
                id="name"
                placeholder="Ex: Viagem para a praia"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">Valor Total (R$)</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">Data de Conclusão</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full">
              Salvar
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

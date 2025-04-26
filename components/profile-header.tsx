"use client"

import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Settings } from "lucide-react"
import { themeConfig } from "@/lib/theme-config"
import { useState, useEffect } from "react"

export function ProfileHeader() {
  const { user } = useAuth()

  // Obter a data atual formatada
  const today = new Date()
  const dayOfWeek = today.toLocaleDateString("pt-BR", { weekday: "long" })
  const formattedDate = today.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })

  // Calcular o número da semana do ano
  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  const weekNumber = getWeekNumber(today)

  // Gerar dias da semana
  const [weekDays, setWeekDays] = useState<{ day: number; name: string; isToday: boolean }[]>([])

  useEffect(() => {
    const days = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SAB"]
    const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    const currentDate = today.getDate()

    // Calcular o primeiro dia da semana (domingo)
    const firstDayOfWeek = new Date(today)
    firstDayOfWeek.setDate(currentDate - currentDay)

    const weekDaysArray = []

    // Gerar os 7 dias da semana
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDayOfWeek)
      date.setDate(firstDayOfWeek.getDate() + i)

      weekDaysArray.push({
        day: date.getDate(),
        name: days[i],
        isToday: i === currentDay,
      })
    }

    setWeekDays(weekDaysArray)
  }, [])

  // Forçar a renderização quando o usuário mudar
  useEffect(() => {
    // Este efeito garante que o componente seja renderizado novamente quando os dados do usuário mudarem
  }, [user])

  return (
    <div className="py-8 px-6" style={{ backgroundColor: themeConfig.colors.background }}>
      <div className="container max-w-md mx-auto">
        <div
          className="p-4 rounded-lg"
          style={{
            backgroundColor: themeConfig.colors.cardBackgroundDark,
            borderRadius: themeConfig.borderRadius.medium,
            boxShadow: themeConfig.shadows.medium,
          }}
        >
          {/* Parte superior com avatar e nome */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-3xl overflow-hidden"
                style={{
                  backgroundColor: themeConfig.colors.cardBackground,
                  boxShadow: themeConfig.shadows.small,
                  border: `1px solid ${themeConfig.colors.border}`,
                }}
              >
                {user?.avatar || "👤"}
              </div>
              <div>
                <h1
                  className="text-2xl font-bold text-white"
                  style={{
                    fontFamily: themeConfig.typography.fontFamily,
                  }}
                >
                  {user?.name || "Usuário"}
                </h1>
                <div className="text-sm text-gray-300 uppercase">
                  {formattedDate} | {dayOfWeek}
                </div>
              </div>
            </div>

            <Link href="/settings">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                }}
              >
                <Settings className="h-5 w-5 text-white" />
              </div>
            </Link>
          </div>

          {/* Card da semana e frase motivacional */}
          <div
            className="bg-white rounded-lg p-4 mb-4 text-center"
            style={{
              borderRadius: themeConfig.borderRadius.medium,
            }}
          >
            <h2 className="text-xl font-bold mb-2">WEEK {weekNumber.toString().padStart(2, "0")}</h2>
            <p className="text-gray-700 italic">
              "{user?.motivationalQuote || "Defina sua frase motivacional no perfil"}"
            </p>
          </div>

          {/* Calendário semanal */}
          <div className="grid grid-cols-7 gap-2 text-center">
            {weekDays.map((day, index) => (
              <div key={index} className="flex flex-col items-center">
                <span className="text-gray-400 text-xs">{day.name}</span>
                <div
                  className={`w-10 h-10 flex items-center justify-center rounded-full mt-1 ${
                    day.isToday ? "bg-gray-600 text-white" : "text-white"
                  }`}
                >
                  {day.day}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

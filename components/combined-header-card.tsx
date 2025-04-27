"use client"
import { useAuth } from "@/lib/auth" // Importando do novo arquivo auth.tsx
import Link from "next/link"
import { Settings } from "lucide-react"

export function CombinedHeaderCard() {
  const { user } = useAuth()

  // Obter a data atual formatada
  const today = new Date()
  const dayOfWeek = today.toLocaleDateString("pt-BR", { weekday: "long" }).toUpperCase()
  const formattedDate = today.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })

  // Calcular o número da semana do ano
  // const getWeekNumber = (date: Date) => {
  //   const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  //   const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  //   return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  // }

  // const weekNumber = getWeekNumber(today)

  // Calcular a semana do mês
  // const getWeekOfMonth = (date: Date) => {
  //   const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
  //   const dayOfMonth = date.getDate()
  //   return Math.ceil((dayOfMonth + firstDayOfMonth.getDay() - 1) / 7)
  // }

  // const weekOfMonth = getWeekOfMonth(today)

  return (
    <div className="bg-[#222222] rounded-xl overflow-hidden shadow-lg w-full max-w-md mx-auto">
      {/* Parte superior com avatar e nome */}
      <div className="p-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center overflow-hidden">
            {user?.avatar ? (
              <span className="text-3xl">{user.avatar}</span>
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">{user?.name || "Usuário Demo"}</h1>
            <div className="flex items-center text-gray-300 mt-1">
              <span className="text-sm">
                {formattedDate} | {dayOfWeek}
              </span>
            </div>
          </div>
        </div>

        <Link href="/settings">
          <div className="w-10 h-10 rounded-full bg-[#444444] flex items-center justify-center">
            <Settings className="h-5 w-5 text-white" />
          </div>
        </Link>
      </div>

      {/* Card da frase motivacional */}
      <div className="bg-white mx-5 rounded-xl p-4 mb-5">
        <p className="text-gray-700 italic text-base">
          "{user?.motivationalQuote || "A riqueza é consequência de trabalho e poupança"}"
        </p>
      </div>
    </div>
  )
}

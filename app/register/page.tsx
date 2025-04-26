"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirecionar para a página de login, já que não estamos permitindo novos registros
    router.push("/login")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Redirecionando...</h1>
        <p className="text-center">Você será redirecionado para a página de login.</p>
      </div>
    </div>
  )
}

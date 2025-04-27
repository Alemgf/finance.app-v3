"use client"

import type React from "react"
import { useState } from "react"
import { useAuth } from "@/lib/auth" // Importando do novo arquivo auth.tsx
import Link from "next/link"
import { themeConfig } from "@/lib/theme-config"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const { signIn, loading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError("Todos os campos são obrigatórios")
      return
    }

    const result = await signIn(email, password)
    if (result.error) {
      setError(result.error)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: themeConfig.colors.background }}
    >
      <div
        className="w-full max-w-md p-6 rounded-lg"
        style={{
          backgroundColor: themeConfig.colors.cardBackground,
          boxShadow: themeConfig.shadows.medium,
          borderRadius: themeConfig.borderRadius.large,
        }}
      >
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>

        {error && (
          <div className="mb-4 p-3 rounded" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md"
              style={{
                border: "1px solid rgba(0,0,0,0.1)",
                backgroundColor: themeConfig.colors.inputBackground,
              }}
              placeholder="seu@email.com"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-md"
              style={{
                border: "1px solid rgba(0,0,0,0.1)",
                backgroundColor: themeConfig.colors.inputBackground,
              }}
              placeholder="Sua senha"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md text-white"
            style={{
              backgroundColor: loading ? "rgba(0,0,0,0.3)" : "#3B82F6", // Cor azul fixa para garantir visibilidade
            }}
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm">
            Não tem uma conta?{" "}
            <Link href="/register" className="font-medium" style={{ color: themeConfig.colors.primary }}>
              Criar conta
            </Link>
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500 mb-2">Contas para teste:</p>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2 rounded" style={{ backgroundColor: "rgba(0,0,0,0.05)" }}>
              <div className="font-bold mb-1">Usuário 1</div>
              <div>teste1@exemplo.com</div>
              <div className="opacity-75">senha123</div>
            </div>
            <div className="p-2 rounded" style={{ backgroundColor: "rgba(0,0,0,0.05)" }}>
              <div className="font-bold mb-1">Usuário 2</div>
              <div>teste2@exemplo.com</div>
              <div className="opacity-75">senha123</div>
            </div>
            <div className="p-2 rounded" style={{ backgroundColor: "rgba(0,0,0,0.05)" }}>
              <div className="font-bold mb-1">Usuário 3</div>
              <div>teste3@exemplo.com</div>
              <div className="opacity-75">senha123</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

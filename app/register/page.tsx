"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createUser } from "@/lib/database"
import { useAuth } from "@/lib/auth" // Importando do novo arquivo auth.tsx
import { themeConfig } from "@/lib/theme-config"

export default function RegisterPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [avatar, setAvatar] = useState("👤")
  const [motivationalQuote, setMotivationalQuote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { signIn } = useAuth()

  // Lista de avatares para seleção
  const avatarOptions = ["👤", "😊", "😎", "🤓", "👩", "👨", "🧑", "👧", "👦", "🧔", "👱", "👸", "🤴", "🦸", "🦹"]

  // Exemplos de frases motivacionais
  const quoteExamples = [
    "Economize hoje para um amanhã melhor",
    "Cada centavo conta na jornada para a liberdade financeira",
    "Sonhe grande, economize aos poucos",
    "Seu futuro financeiro depende das suas escolhas de hoje",
    "Planeje suas finanças e alcance seus sonhos",
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    // Validações básicas
    if (!name || !email || !password) {
      setError("Todos os campos obrigatórios devem ser preenchidos")
      setLoading(false)
      return
    }

    if (password.length < 4) {
      setError("A senha deve ter pelo menos 4 caracteres")
      setLoading(false)
      return
    }

    try {
      // Criar o usuário no banco de dados
      const newUser = await createUser({
        name,
        email,
        password,
        avatar,
        motivationalQuote: motivationalQuote || quoteExamples[Math.floor(Math.random() * quoteExamples.length)],
      })

      if (!newUser) {
        setError("Erro ao criar conta. Este email já pode estar em uso.")
        setLoading(false)
        return
      }

      // Mostrar mensagem de sucesso
      setSuccess(true)

      // Aguardar 2 segundos e fazer login automaticamente
      setTimeout(async () => {
        // Fazer login automaticamente após o registro
        const loginResult = await signIn(email, password)

        if (loginResult.error) {
          setError(loginResult.error)
          setLoading(false)
          return
        }

        // Redirecionar para a página inicial após o login bem-sucedido
        router.push("/")
      }, 2000)
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro ao criar sua conta")
      setLoading(false)
    }
  }

  const selectAvatar = (emoji: string) => {
    setAvatar(emoji)
  }

  const selectQuote = (quote: string) => {
    setMotivationalQuote(quote)
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
        <h1 className="text-2xl font-bold mb-6 text-center">Criar Nova Conta</h1>

        {error && (
          <div className="mb-4 p-3 rounded" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded" style={{ backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
            Conta criada com sucesso! Redirecionando...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-md"
              style={{
                border: "1px solid rgba(0,0,0,0.1)",
                backgroundColor: themeConfig.colors.inputBackground,
              }}
              placeholder="Seu nome"
              disabled={loading || success}
            />
          </div>

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
              disabled={loading || success}
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
              placeholder="Mínimo de 4 caracteres"
              disabled={loading || success}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Escolha seu avatar</label>
            <div className="flex flex-wrap gap-2">
              {avatarOptions.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => selectAvatar(emoji)}
                  className={`w-10 h-10 text-xl flex items-center justify-center rounded-full ${
                    avatar === emoji ? "ring-2 ring-offset-2" : ""
                  }`}
                  style={{
                    backgroundColor: avatar === emoji ? themeConfig.colors.primary : themeConfig.colors.inputBackground,
                    color: avatar === emoji ? "white" : "inherit",
                    ringColor: themeConfig.colors.primary,
                  }}
                  disabled={loading || success}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Frase motivacional (opcional)</label>
            <input
              type="text"
              value={motivationalQuote}
              onChange={(e) => setMotivationalQuote(e.target.value)}
              className="w-full px-3 py-2 rounded-md mb-2"
              style={{
                border: "1px solid rgba(0,0,0,0.1)",
                backgroundColor: themeConfig.colors.inputBackground,
              }}
              placeholder="Digite sua frase motivacional"
              disabled={loading || success}
            />
            <div className="text-xs mb-1">Ou escolha uma das opções abaixo:</div>
            <div className="flex flex-wrap gap-2">
              {quoteExamples.map((quote, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectQuote(quote)}
                  className="px-2 py-1 text-xs rounded"
                  style={{
                    backgroundColor: motivationalQuote === quote ? themeConfig.colors.primary : "rgba(0,0,0,0.05)",
                    color: motivationalQuote === quote ? "white" : "inherit",
                  }}
                  disabled={loading || success}
                >
                  {quote.length > 20 ? quote.substring(0, 20) + "..." : quote}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 rounded-md text-white"
            style={{
              backgroundColor: loading || success ? "rgba(0,0,0,0.3)" : "#3B82F6", // Cor azul fixa para garantir visibilidade
            }}
            disabled={loading || success}
          >
            {loading ? "Criando conta..." : success ? "Conta criada!" : "Criar Conta"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{" "}
            <Link href="/login" className="font-medium" style={{ color: themeConfig.colors.primary }}>
              Faça login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

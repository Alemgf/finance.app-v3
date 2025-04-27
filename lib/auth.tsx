"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authenticateUser, getUserById } from "./database"
import { setCookie, deleteCookie } from "cookies-next"

// Definir os tipos
type User = {
  id: string
  name: string
  email: string
  avatar?: string
  motivationalQuote?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error?: string }>
  signOut: () => Promise<void>
  updateProfile: (data: { name?: string; avatar?: string; motivationalQuote?: string }) => Promise<void>
}

// Criar o contexto
const AuthContext = createContext<AuthContextType | null>(null)

// Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Verificar autenticação ao carregar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userId = localStorage.getItem("userId")

        // Verificar o caminho atual
        const currentPath = window.location.pathname
        const isAuthPage = currentPath === "/login" || currentPath === "/register"

        if (userId) {
          const userData = await getUserById(userId)
          if (userData) {
            setUser(userData)
            // Sincronizar com cookie para middleware
            setCookie("userId", userId, { maxAge: 60 * 60 * 24 * 7 }) // 7 dias

            // Se estiver em uma página de autenticação, redirecionar para home
            if (isAuthPage) {
              router.push("/")
            }
          } else {
            // Limpar dados se usuário não for encontrado
            localStorage.removeItem("userId")
            deleteCookie("userId")
            setUser(null)

            // Só redirecionar se não estiver já em uma página de autenticação
            if (!isAuthPage) {
              router.push("/login")
            }
          }
        } else {
          // Sem userId, definir usuário como null
          setUser(null)

          // Só redirecionar se não estiver já em uma página de autenticação
          if (!isAuthPage) {
            router.push("/login")
          }
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  // Função de login
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const userData = await authenticateUser(email, password)

      if (!userData) {
        return { error: "Email ou senha incorretos" }
      }

      // Salvar ID do usuário
      localStorage.setItem("userId", userData.id)
      setCookie("userId", userData.id, { maxAge: 60 * 60 * 24 * 7 }) // 7 dias

      setUser(userData)
      router.push("/")
      return {}
    } catch (error: any) {
      return { error: error.message || "Erro ao fazer login" }
    } finally {
      setLoading(false)
    }
  }

  // Função de logout
  const signOut = async () => {
    try {
      setLoading(true)
      localStorage.removeItem("userId")
      deleteCookie("userId")
      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    } finally {
      setLoading(false)
    }
  }

  // Função para atualizar perfil
  const updateProfile = async (data: { name?: string; avatar?: string; motivationalQuote?: string }) => {
    if (!user) return

    try {
      // Implementar atualização de perfil
      // Esta é uma implementação simplificada
      setUser((prev) => {
        if (!prev) return null
        return { ...prev, ...data }
      })
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
    }
  }

  // Valor do contexto
  const value = {
    user,
    loading,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook para usar o contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

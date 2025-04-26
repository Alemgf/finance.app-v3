"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { getUser, getUserById } from "./database"
import { supabase } from "./supabase"
import { setCookie, deleteCookie } from "cookies-next"

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

// Criar o contexto com um valor padrão undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Definir o AuthProvider primeiro
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Verificar se o usuário está autenticado ao carregar a página
  useEffect(() => {
    const checkUser = async () => {
      try {
        // Verificar se há um ID de usuário no localStorage
        const userId = localStorage.getItem("userId")
        if (userId) {
          const userData = await getUserById(userId)
          if (userData) {
            setUser(userData)
            // Também definir o cookie para o middleware
            setCookie("userId", userId, { maxAge: 60 * 60 * 24 * 7 }) // 7 dias
          } else {
            // Se o usuário não for encontrado, limpar o localStorage e cookies
            localStorage.removeItem("userId")
            deleteCookie("userId")
            setUser(null)
            router.push("/login")
          }
        } else {
          setUser(null)
          router.push("/login")
        }
      } catch (error) {
        console.error("Erro ao verificar autenticação:", error)
        setUser(null)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const userData = await getUser(email, password)

      if (!userData) {
        return { error: "Email ou senha incorretos" }
      }

      // Salvar o ID do usuário no localStorage e cookie
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

  const signOut = async () => {
    try {
      setLoading(true)
      // Limpar o localStorage e cookie
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

  const updateProfile = async (data: { name?: string; avatar?: string; motivationalQuote?: string }) => {
    if (!user) return

    try {
      // Preparar os dados para atualização no formato do banco de dados
      const updateData: Record<string, any> = {}
      if (data.name !== undefined) updateData.name = data.name
      if (data.avatar !== undefined) updateData.avatar = data.avatar
      if (data.motivationalQuote !== undefined) updateData.motivational_quote = data.motivationalQuote

      // Atualizar no banco de dados
      const { error } = await supabase.from("users").update(updateData).eq("id", user.id)

      if (error) {
        console.error("Erro ao atualizar perfil:", error)
        throw error
      }

      // Atualizar o estado local
      setUser((prev) => {
        if (!prev) return null
        return { ...prev, ...data }
      })

      // Recarregar os dados do usuário para garantir sincronização
      const updatedUser = await getUserById(user.id)
      if (updatedUser) {
        setUser(updatedUser)
      }
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
    }
  }

  // Criar o valor do contexto fora do JSX para evitar recriações desnecessárias
  const contextValue = {
    user,
    loading,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

// Definir o hook useAuth depois do AuthProvider
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

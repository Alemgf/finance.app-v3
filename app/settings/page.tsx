"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, LogOut, User, Eye, EyeOff, Edit, Check, X, Quote, CreditCard } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { toast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { themeConfig } from "@/lib/theme-config"
import { BottomMenu } from "@/components/bottom-menu"

export default function SettingsPage() {
  const { user, signOut, updateProfile } = useAuth()

  // Estados para o perfil
  const [selectedAvatar, setSelectedAvatar] = useState<string>("👤")
  const [isEditingName, setIsEditingName] = useState(false)
  const [userName, setUserName] = useState("Usuário Demo")
  const nameInputRef = useRef<HTMLInputElement>(null)
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)

  // Estado para a frase motivacional
  const [isEditingQuote, setIsEditingQuote] = useState(false)
  const [motivationalQuote, setMotivationalQuote] = useState("")
  const quoteInputRef = useRef<HTMLTextAreaElement>(null)

  // Estados para senha
  const [showPassword, setShowPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // Atualizar estados quando o usuário for carregado
  useEffect(() => {
    if (user) {
      setUserName(user.name || "Usuário Demo")
      setSelectedAvatar(user.avatar || "👤")
      setMotivationalQuote(user.motivationalQuote || "")
    }
  }, [user])

  // Focar no input de nome quando entrar no modo de edição
  useEffect(() => {
    if (isEditingName && nameInputRef.current) {
      nameInputRef.current.focus()
    }
  }, [isEditingName])

  // Focar no input de frase quando entrar no modo de edição
  useEffect(() => {
    if (isEditingQuote && quoteInputRef.current) {
      quoteInputRef.current.focus()
    }
  }, [isEditingQuote])

  const handleSaveName = () => {
    if (userName.trim()) {
      updateProfile({ name: userName })
      setIsEditingName(false)
      toast({
        title: "Nome atualizado",
        description: "Seu nome de usuário foi atualizado com sucesso.",
      })
    } else {
      toast({
        title: "Erro",
        description: "O nome não pode estar vazio.",
        variant: "destructive",
      })
    }
  }

  const handleCancelNameEdit = () => {
    setUserName(user?.name || "Usuário Demo")
    setIsEditingName(false)
  }

  const handleSaveQuote = () => {
    updateProfile({ motivationalQuote })
    setIsEditingQuote(false)
    toast({
      title: "Frase motivacional atualizada",
      description: "Sua frase motivacional foi atualizada com sucesso.",
    })
  }

  const handleCancelQuoteEdit = () => {
    setMotivationalQuote(user?.motivationalQuote || "")
    setIsEditingQuote(false)
  }

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem!",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      })
      return
    }

    // Aqui você implementaria a lógica para alterar a senha
    // Como estamos usando um mock, apenas resetamos os campos
    setNewPassword("")
    setConfirmPassword("")
    setIsChangingPassword(false)

    toast({
      title: "Senha alterada",
      description: "Sua senha foi alterada com sucesso.",
    })
  }

  const handleAvatarSelect = (emoji: string) => {
    // Limitar a um único emoji
    const singleEmoji = emoji.slice(0, 2)
    setSelectedAvatar(singleEmoji)
    updateProfile({ avatar: singleEmoji })
  }

  const handleLogout = async () => {
    await signOut()
  }

  return (
    <div className="container max-w-md mx-auto p-4 pb-20" style={{ backgroundColor: themeConfig.colors.background }}>
      <header
        className="p-4 -mx-4 -mt-4 mb-4 flex items-center"
        style={{ backgroundColor: themeConfig.colors.cardBackgroundDark }}
      >
        <Link href="/" className="mr-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
            <ArrowLeft className="h-5 w-5 text-white" />
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: themeConfig.typography.fontFamily }}>
          Ajustes
        </h1>
      </header>

      <div className="space-y-6">
        {/* Perfil do Usuário */}
        <div
          className="p-6"
          style={{
            backgroundColor: themeConfig.colors.cardBackground,
            borderRadius: themeConfig.borderRadius.medium,
            boxShadow: themeConfig.shadows.medium,
          }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: themeConfig.colors.textPrimary }}>
            Perfil do Usuário
          </h2>
          <div className="flex flex-col items-center space-y-4">
            {/* Avatar com modal */}
            <div className="space-y-2 text-center">
              <div className="text-6xl mb-2">{selectedAvatar}</div>
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAvatarDialogOpen(true)}
                  style={{
                    borderColor: themeConfig.colors.border,
                    color: themeConfig.colors.textSecondary,
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Alterar avatar
                </Button>
              </div>

              <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                <DialogContent
                  className="sm:max-w-[425px]"
                  style={{
                    backgroundColor: themeConfig.colors.cardBackground,
                    borderRadius: themeConfig.borderRadius.large,
                  }}
                >
                  <DialogHeader>
                    <DialogTitle style={{ color: themeConfig.colors.textPrimary }}>Alterar avatar</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="text-center">
                      <div className="text-6xl mb-4">{selectedAvatar}</div>
                      <Label htmlFor="avatar-input" className="mb-2 block">
                        Escolha um emoji
                      </Label>
                      <Input
                        id="avatar-input"
                        value={selectedAvatar}
                        onChange={(e) => handleAvatarSelect(e.target.value)}
                        className="text-center text-2xl"
                        maxLength={2}
                        style={{
                          borderColor: themeConfig.colors.border,
                          borderRadius: themeConfig.borderRadius.small,
                        }}
                      />
                      <p className="text-xs text-muted-foreground mt-2">Use o seletor de emoji do seu teclado</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button
                      onClick={() => {
                        toast({
                          title: "Avatar atualizado",
                          description: "Seu avatar foi atualizado com sucesso.",
                        })
                        setIsAvatarDialogOpen(false)
                      }}
                      style={{
                        backgroundColor: themeConfig.colors.cardBackgroundDark,
                        color: "white",
                      }}
                    >
                      Salvar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAvatarDialogOpen(false)}
                      style={{
                        borderColor: themeConfig.colors.border,
                        color: themeConfig.colors.textSecondary,
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="text-center w-full">
              {isEditingName ? (
                <div className="space-y-2">
                  <Input
                    ref={nameInputRef}
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="text-center font-medium"
                    style={{
                      borderColor: themeConfig.colors.border,
                      borderRadius: themeConfig.borderRadius.small,
                    }}
                  />
                  <div className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveName}
                      style={{
                        backgroundColor: themeConfig.colors.cardBackgroundDark,
                        color: "white",
                      }}
                    >
                      <Check className="h-4 w-4 mr-1" /> Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancelNameEdit}
                      style={{
                        borderColor: themeConfig.colors.border,
                        color: themeConfig.colors.textSecondary,
                      }}
                    >
                      <X className="h-4 w-4 mr-1" /> Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <h3 className="font-medium text-lg" style={{ color: themeConfig.colors.textPrimary }}>
                    {userName}
                  </h3>
                  <button onClick={() => setIsEditingName(true)} style={{ color: themeConfig.colors.accent }}>
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              )}
              <p style={{ color: themeConfig.colors.textSecondary }}>{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Frase Motivacional */}
        <div
          className="p-6"
          style={{
            backgroundColor: themeConfig.colors.cardBackground,
            borderRadius: themeConfig.borderRadius.medium,
            boxShadow: themeConfig.shadows.medium,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Quote className="h-5 w-5" style={{ color: themeConfig.colors.accent }} />
            <h2 className="text-xl font-semibold" style={{ color: themeConfig.colors.textPrimary }}>
              Frase Motivacional
            </h2>
          </div>

          {isEditingQuote ? (
            <div className="space-y-4">
              <Textarea
                ref={quoteInputRef}
                value={motivationalQuote}
                onChange={(e) => setMotivationalQuote(e.target.value)}
                placeholder="Digite sua frase motivacional..."
                className="min-h-[100px]"
                style={{
                  borderColor: themeConfig.colors.border,
                  borderRadius: themeConfig.borderRadius.small,
                }}
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSaveQuote}
                  style={{
                    backgroundColor: themeConfig.colors.cardBackgroundDark,
                    color: "white",
                  }}
                >
                  <Check className="h-4 w-4 mr-1" /> Salvar
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancelQuoteEdit}
                  style={{
                    borderColor: themeConfig.colors.border,
                    color: themeConfig.colors.textSecondary,
                  }}
                >
                  <X className="h-4 w-4 mr-1" /> Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="bg-gray-50 p-4 rounded-lg relative"
              style={{ borderRadius: themeConfig.borderRadius.small }}
            >
              <p className="italic text-gray-700">
                {motivationalQuote || "Defina sua frase motivacional para exibir na tela inicial"}
              </p>
              <button
                onClick={() => setIsEditingQuote(true)}
                className="absolute top-2 right-2"
                style={{ color: themeConfig.colors.accent }}
              >
                <Edit className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Contas Bancárias */}
        <div
          className="p-6"
          style={{
            backgroundColor: themeConfig.colors.cardBackground,
            borderRadius: themeConfig.borderRadius.medium,
            boxShadow: themeConfig.shadows.medium,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5" style={{ color: themeConfig.colors.accent }} />
            <h2 className="text-xl font-semibold" style={{ color: themeConfig.colors.textPrimary }}>
              Contas Bancárias
            </h2>
          </div>

          <Link href="/accounts">
            <Button
              className="w-full"
              style={{
                backgroundColor: themeConfig.colors.cardBackgroundDark,
                color: "white",
              }}
            >
              Gerenciar Contas Bancárias
            </Button>
          </Link>
        </div>

        {/* Informações de Login */}
        <div
          className="p-6"
          style={{
            backgroundColor: themeConfig.colors.cardBackground,
            borderRadius: themeConfig.borderRadius.medium,
            boxShadow: themeConfig.shadows.medium,
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5" style={{ color: themeConfig.colors.accent }} />
            <h2 className="text-xl font-semibold" style={{ color: themeConfig.colors.textPrimary }}>
              Informações de Login
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email" style={{ color: themeConfig.colors.textSecondary }}>
                Email
              </Label>
              <Input
                id="email"
                value={user?.email}
                readOnly
                className="bg-gray-50"
                style={{
                  borderColor: themeConfig.colors.border,
                  borderRadius: themeConfig.borderRadius.small,
                  backgroundColor: "#f9f9f9",
                }}
              />
            </div>

            <div>
              <Label htmlFor="current-password" style={{ color: themeConfig.colors.textSecondary }}>
                Senha atual
              </Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword ? "text" : "password"}
                  defaultValue="********"
                  readOnly
                  className="bg-gray-50 pr-10"
                  style={{
                    borderColor: themeConfig.colors.border,
                    borderRadius: themeConfig.borderRadius.small,
                    backgroundColor: "#f9f9f9",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isChangingPassword ? (
              <div className="space-y-4 pt-4 border-t" style={{ borderColor: themeConfig.colors.border }}>
                <div>
                  <Label htmlFor="new-password" style={{ color: themeConfig.colors.textSecondary }}>
                    Nova Senha
                  </Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="pr-10"
                      style={{
                        borderColor: themeConfig.colors.border,
                        borderRadius: themeConfig.borderRadius.small,
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="confirm-password" style={{ color: themeConfig.colors.textSecondary }}>
                    Confirmar Senha
                  </Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{
                      borderColor: themeConfig.colors.border,
                      borderRadius: themeConfig.borderRadius.small,
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handlePasswordChange}
                    style={{
                      backgroundColor: themeConfig.colors.cardBackgroundDark,
                      color: "white",
                    }}
                  >
                    Salvar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsChangingPassword(false)}
                    style={{
                      borderColor: themeConfig.colors.border,
                      color: themeConfig.colors.textSecondary,
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setIsChangingPassword(true)}
                className="w-full mt-2"
                style={{
                  borderColor: themeConfig.colors.border,
                  color: themeConfig.colors.textSecondary,
                }}
              >
                Alterar Senha
              </Button>
            )}
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
          style={{
            backgroundColor: "#ef4444",
            color: "white",
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>

      <BottomMenu />
    </div>
  )
}

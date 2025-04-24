"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { LogOut, User, Lock } from "lucide-react"

// Lista de emojis para seleção de avatar
const avatarEmojis = [
  "👤",
  "👨",
  "👩",
  "👶",
  "👦",
  "👧",
  "👨‍🦰",
  "👩‍🦰",
  "👨‍🦱",
  "👩‍🦱",
  "👨‍🦳",
  "👩‍🦳",
  "👨‍🦲",
  "👩‍🦲",
  "👱‍♂️",
  "👱‍♀️",
  "👴",
  "👵",
  "🧔",
  "🧓",
  "👮‍♂️",
  "👮‍♀️",
  "👷‍♂️",
  "👷‍♀️",
  "👨‍⚕️",
  "👩‍⚕️",
  "👨‍🎓",
  "👩‍🎓",
  "👨‍🏫",
  "👩‍🏫",
  "👨‍⚖️",
  "👩‍⚖️",
  "👨‍🌾",
  "👩‍🌾",
  "👨‍🍳",
  "👩‍🍳",
  "👨‍🔧",
  "👩‍🔧",
  "👨‍🏭",
  "👩‍🏭",
  "👨‍💼",
  "👩‍💼",
  "👨‍🔬",
  "👩‍🔬",
  "👨‍💻",
  "👩‍💻",
  "👨‍🎤",
  "👩‍🎤",
  "👨‍🎨",
  "👩‍🎨",
  "👨‍✈️",
  "👩‍✈️",
  "👨‍🚀",
  "👩‍🚀",
  "👨‍🚒",
  "👩‍🚒",
  "🧙‍♂️",
  "🧙‍♀️",
  "🧚‍♂️",
  "🧚‍♀️",
  "🧛‍♂️",
  "🧛‍♀️",
  "🧜‍♂️",
  "🧜‍♀️",
  "🧝‍♂️",
  "🧝‍♀️",
  "🧞‍♂️",
  "🧞‍♀️",
  "🧟‍♂️",
  "🧟‍♀️",
  "🧖‍♂️",
  "🧖‍♀️",
  "🧗‍♂️",
  "🧗‍♀️",
  "🧘‍♂️",
  "🧘‍♀️",
  "🦸‍♂️",
  "🦸‍♀️",
  "🦹‍♂️",
  "🦹‍♀️",
  "🤶",
  "🎅",
  "👸",
  "🤴",
  "🤵",
  "👰",
  "🤱",
  "🤰",
  "🦊",
  "🐱",
  "🐶",
  "🐼",
  "🐨",
  "🐯",
]

export function UserMenu() {
  const { user, signOut, updateProfile } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "👤")
  const [isAvatarSelectorOpen, setIsAvatarSelectorOpen] = useState(false)

  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      alert("As senhas não coincidem!")
      return
    }

    // Aqui você implementaria a lógica para alterar a senha
    // Como estamos usando um mock, apenas resetamos os campos
    setNewPassword("")
    setConfirmPassword("")
    setIsChangingPassword(false)
    alert("Senha alterada com sucesso!")
  }

  const handleAvatarSelect = (emoji: string) => {
    setSelectedAvatar(emoji)
    updateProfile({ avatar: emoji })
    setIsAvatarSelectorOpen(false)
  }

  const handleLogout = async () => {
    await signOut()
    setIsOpen(false)
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="mr-4 flex items-center justify-center">
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <SheetHeader>
          <SheetTitle>Perfil do Usuário</SheetTitle>
        </SheetHeader>

        <div className="py-6 flex flex-col items-center space-y-4">
          <Popover open={isAvatarSelectorOpen} onOpenChange={setIsAvatarSelectorOpen}>
            <PopoverTrigger asChild>
              <button className="text-6xl hover:opacity-80 transition-opacity">{selectedAvatar}</button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-2">
              <div className="grid grid-cols-8 gap-2">
                {avatarEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    className="text-2xl p-1 hover:bg-gray-100 rounded"
                    onClick={() => handleAvatarSelect(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <div className="text-center">
            <h3 className="font-medium text-lg">{user?.name || "Usuário"}</h3>
            <p className="text-muted-foreground">{user?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Informações de Login</span>
          </div>

          <div className="pl-7 space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email} readOnly className="bg-gray-50" />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-6">
            <Lock className="h-5 w-5 text-blue-500" />
            <span className="font-medium">Segurança</span>
          </div>

          {isChangingPassword ? (
            <div className="pl-7 space-y-4">
              <div>
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="confirm-password">Confirmar Senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handlePasswordChange}>Salvar</Button>
                <Button variant="outline" onClick={() => setIsChangingPassword(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="pl-7">
              <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
                Alterar Senha
              </Button>
            </div>
          )}
        </div>

        <SheetFooter className="absolute bottom-0 left-0 right-0 p-6">
          <Button variant="destructive" className="w-full" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

"use client"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export function SimplifiedUserMenu() {
  return (
    <Sheet>
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
          <div className="text-6xl">👤</div>
          <div className="text-center">
            <h3 className="font-medium text-lg">Usuário Demo</h3>
            <p className="text-muted-foreground">demo@example.com</p>
          </div>
        </div>

        <SheetFooter className="absolute bottom-0 left-0 right-0 p-6">
          <Button variant="destructive" className="w-full">
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

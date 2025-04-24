"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, PieChart, Plus, Settings, CreditCard } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomMenu() {
  const pathname = usePathname()

  const menuItems = [
    {
      icon: Home,
      label: "Início",
      href: "/",
      active: pathname === "/",
    },
    {
      icon: PieChart,
      label: "Tabelas",
      href: "/tables",
      active: pathname === "/tables" || pathname.startsWith("/tables/"),
    },
    {
      icon: Plus,
      label: "Adicionar",
      href: "/expenses/new",
      active: pathname === "/expenses/new",
    },
    {
      icon: CreditCard,
      label: "Contas",
      href: "/accounts",
      active: pathname === "/accounts",
    },
    {
      icon: Settings,
      label: "Ajustes",
      href: "/settings",
      active: pathname === "/settings",
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50">
      <div className="container max-w-md mx-auto">
        <div className="flex justify-between items-center">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center py-2 px-4 text-xs",
                item.active ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5 mb-1" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

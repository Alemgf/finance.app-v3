"use client"

import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { themeConfig } from "@/lib/theme-config"
import { BottomMenu } from "@/components/bottom-menu"
import { TablesTab } from "@/components/tables-tab"

export default function TablesPage() {
  return (
    <div className="pb-20" style={{ backgroundColor: themeConfig.colors.background }}>
      <header className="p-4 flex items-center" style={{ backgroundColor: themeConfig.colors.cardBackgroundDark }}>
        <Link href="/" className="mr-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/20">
            <ArrowLeft className="h-5 w-5 text-white" />
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-white" style={{ fontFamily: themeConfig.typography.fontFamily }}>
          Tabelas
        </h1>
      </header>

      <div className="container max-w-md mx-auto p-4 space-y-6">
        <TablesTab />
      </div>

      <BottomMenu />
    </div>
  )
}

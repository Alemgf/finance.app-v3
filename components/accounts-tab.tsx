"use client"

import { BankAccountManager } from "@/components/bank-account-manager"
import { AccountSummary } from "@/components/account-summary"

export function AccountsTab() {
  return (
    <div className="space-y-6">
      <BankAccountManager />
      <AccountSummary />
    </div>
  )
}

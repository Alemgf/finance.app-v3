export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          target_amount: number
          saved_amount: number
          start_date: string
          end_date: string
          daily_budget: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          target_amount: number
          saved_amount?: number
          start_date: string
          end_date: string
          daily_budget: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          target_amount?: number
          saved_amount?: number
          start_date?: string
          end_date?: string
          daily_budget?: number
          created_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          goal_id: string | null
          date: string
          description: string
          amount: number
          location: string | null
          is_paid: boolean
          is_fixed: boolean
          payment_type: string
          is_validated: boolean
          categories: string[]
          bank: string | null
          type: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id?: string | null
          date: string
          description: string
          amount: number
          location?: string | null
          is_paid?: boolean
          is_fixed?: boolean
          payment_type?: string
          is_validated?: boolean
          categories?: string[]
          bank?: string | null
          type: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string | null
          date?: string
          description?: string
          amount?: number
          location?: string | null
          is_paid?: boolean
          is_fixed?: boolean
          payment_type?: string
          is_validated?: boolean
          categories?: string[]
          bank?: string | null
          type?: string
          created_at?: string
        }
      }
      budget_adjustments: {
        Row: {
          id: string
          user_id: string
          goal_id: string
          adjustment_date: string
          adjusted_amount: number
          excess: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id: string
          adjustment_date: string
          adjusted_amount: number
          excess: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_id?: string
          adjustment_date?: string
          adjusted_amount?: number
          excess?: number
          created_at?: string
        }
      }
      bank_accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          debit_balance: number | null
          credit_limit: number | null
          credit_used: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          debit_balance?: number | null
          credit_limit?: number | null
          credit_used?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          debit_balance?: number | null
          credit_limit?: number | null
          credit_used?: number | null
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          type: string
          label: string
          value: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          label: string
          value: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          label?: string
          value?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

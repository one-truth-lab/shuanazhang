export type Tenure = 'lt1' | '1to3' | 'gt3'
export type SpendCategory = 'groceries' | 'dining' | 'travel' | 'gas' | 'shopping' | 'bills' | 'housing'
export type GroceryStore = 'costco' | 'sobeys' | 'other'
export type CreditStatus = 'none' | 'new' | 'established'
export type IncomeLevel = 'low' | 'mid' | 'high'
export type MonthlySpend = 'lt1500' | '1500to3000' | 'gt3000'

export interface Answers {
  tenure: Tenure
  spending: SpendCategory[]
  groceryStore: GroceryStore
  credit: CreditStatus
  income: IncomeLevel
  monthlySpend: MonthlySpend
}

export interface Card {
  id: string
  nameEn: string
  nameZh: string
  annualFee: number
  network: 'Visa' | 'Mastercard' | 'Amex'
  issuer: string
  minIncome: number
  requiresCreditHistory: boolean
  newcomerProgram: boolean
  rewards: Partial<Record<SpendCategory, number>> & { base: number }
  noForeignFee: boolean
  sobeysBonus: boolean
  category: 'newcomer' | 'no-fee' | 'cashback' | 'travel' | 'premium'
  highlights: string[]
  applyUrl: string
}

export interface Recommendation {
  card: Card
  score: number
  reason: string
}

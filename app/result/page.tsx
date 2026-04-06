import { getRecommendations, getComboTip } from '@/lib/recommend'
import { Answers, Tenure, SpendCategory, GroceryStore, CreditStatus, IncomeLevel, MonthlySpend } from '@/lib/types'
import Results from '@/components/Results'
import Link from 'next/link'

type SearchParams = Promise<{
  tenure?: string
  spending?: string
  groceryStore?: string
  credit?: string
  income?: string
  monthlySpend?: string
}>

function parseAnswers(params: Awaited<SearchParams>): Answers | null {
  const tenure = params.tenure as Tenure
  const credit = params.credit as CreditStatus
  const income = params.income as IncomeLevel
  const monthlySpend = params.monthlySpend as MonthlySpend
  const spending = params.spending?.split(',').filter(Boolean) as SpendCategory[]
  const groceryStore = (params.groceryStore ?? 'other') as GroceryStore

  if (!tenure || !credit || !income || !monthlySpend || !spending?.length) return null

  const validTenure: Tenure[] = ['lt1', '1to3', 'gt3']
  const validCredit: CreditStatus[] = ['none', 'new', 'established']
  const validIncome: IncomeLevel[] = ['low', 'mid', 'high']
  const validMonthlySpend: MonthlySpend[] = ['lt1500', '1500to3000', 'gt3000']
  const validSpend = new Set<SpendCategory>(['groceries', 'dining', 'travel', 'gas', 'shopping', 'bills', 'housing'])
  const validGrocery: GroceryStore[] = ['costco', 'sobeys', 'other']

  if (!validTenure.includes(tenure)) return null
  if (!validCredit.includes(credit)) return null
  if (!validIncome.includes(income)) return null
  if (!validMonthlySpend.includes(monthlySpend)) return null
  if (!spending.every(s => validSpend.has(s))) return null
  if (!validGrocery.includes(groceryStore)) return null

  return { tenure, spending, groceryStore, credit, income, monthlySpend }
}

export default async function ResultPage({ searchParams }: Readonly<{ searchParams: SearchParams }>) {
  const params = await searchParams
  const answers = parseAnswers(params)

  if (!answers) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <p className="text-slate-600">问卷数据无效，请重新填写。</p>
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl"
          >
            重新开始
          </Link>
        </div>
      </div>
    )
  }

  const recommendations = getRecommendations(answers)
  const comboTip = getComboTip(answers, recommendations)

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-baseline gap-2">
          <Link href="/" className="font-serif font-bold text-xl text-slate-900 hover:opacity-80">
            刷哪张
          </Link>
          <span className="text-slate-400 text-sm">加拿大信用卡推荐</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-8">
        <Results recommendations={recommendations} comboTip={comboTip} />
      </main>

      <footer className="text-center text-slate-400 text-xs py-6 px-4">
        <p>推荐仅供参考，请以各银行官网为准。申请链接含推广追踪。</p>
      </footer>
    </div>
  )
}

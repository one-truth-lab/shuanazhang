'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Answers, Tenure, SpendCategory, GroceryStore, CreditStatus, IncomeLevel, MonthlySpend } from '@/lib/types'

// Step 3 (grocery store) is only shown if user selected groceries in Step 2.
// So total visible steps vary: 5 (no groceries) or 6 (with groceries).

type PartialAnswers = {
  tenure: Tenure | null
  spending: SpendCategory[]
  groceryStore: GroceryStore
  credit: CreditStatus | null
  income: IncomeLevel | null
  monthlySpend: MonthlySpend | null
}

// Logical steps: 1=tenure, 2=spending, 3=grocery(conditional), 4=credit, 5=income, 6=monthlySpend
type LogicalStep = 1 | 2 | 3 | 4 | 5 | 6

export default function Quiz() {
  const router = useRouter()
  const [step, setStep] = useState<LogicalStep>(1)
  const [answers, setAnswers] = useState<PartialAnswers>({
    tenure: null,
    spending: [],
    groceryStore: 'other',
    credit: null,
    income: null,
    monthlySpend: null,
  })

  const hasGroceries = answers.spending.includes('groceries')

  // Ordered list of steps user will see
  const visibleSteps: LogicalStep[] = hasGroceries
    ? [1, 2, 3, 4, 5, 6]
    : [1, 2, 4, 5, 6]

  const currentIndex = visibleSteps.indexOf(step)
  const totalVisible = visibleSteps.length
  const isLastStep = currentIndex === totalVisible - 1

  const canProceed =
    (step === 1 && answers.tenure !== null) ||
    (step === 2 && answers.spending.length > 0) ||
    step === 3 || // grocery store always has a default
    (step === 4 && answers.credit !== null) ||
    (step === 5 && answers.income !== null) ||
    (step === 6 && answers.monthlySpend !== null)

  function next() {
    if (!isLastStep) {
      setStep(visibleSteps[currentIndex + 1])
    } else {
      const a = answers as Answers
      const params = new URLSearchParams({
        tenure: a.tenure,
        spending: a.spending.join(','),
        groceryStore: a.groceryStore,
        credit: a.credit,
        income: a.income,
        monthlySpend: a.monthlySpend,
      })
      router.push(`/result?${params.toString()}`)
    }
  }

  function back() {
    if (currentIndex > 0) setStep(visibleSteps[currentIndex - 1])
  }

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="w-full">
        <div className="flex justify-between text-sm text-slate-500 mb-2">
          <span>第 {currentIndex + 1} 步，共 {totalVisible} 步</span>
          <span>{Math.round(((currentIndex + 1) / totalVisible) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex + 1) / totalVisible) * 100}%` }}
          />
        </div>
      </div>

      {step === 1 && (
        <Step1 value={answers.tenure} onChange={v => setAnswers(a => ({ ...a, tenure: v }))} />
      )}
      {step === 2 && (
        <Step2
          value={answers.spending}
          onChange={v => {
            // If groceries deselected, reset groceryStore
            const next = v
            const wasSelected = answers.spending.includes('groceries')
            const nowSelected = next.includes('groceries')
            setAnswers(a => ({
              ...a,
              spending: next,
              groceryStore: wasSelected && nowSelected === false ? 'other' : a.groceryStore,
            }))
          }}
        />
      )}
      {step === 3 && (
        <Step3Grocery
          value={answers.groceryStore}
          onChange={v => setAnswers(a => ({ ...a, groceryStore: v }))}
        />
      )}
      {step === 4 && (
        <Step4Credit value={answers.credit} onChange={v => setAnswers(a => ({ ...a, credit: v }))} />
      )}
      {step === 5 && (
        <Step5Income value={answers.income} onChange={v => setAnswers(a => ({ ...a, income: v }))} />
      )}
      {step === 6 && (
        <Step6MonthlySpend value={answers.monthlySpend} onChange={v => setAnswers(a => ({ ...a, monthlySpend: v }))} />
      )}

      <div className="flex gap-3">
        {currentIndex > 0 && (
          <button
            onClick={back}
            className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-600 font-medium text-sm hover:bg-slate-100 transition-colors"
          >
            上一步
          </button>
        )}
        <button
          onClick={next}
          disabled={!canProceed}
          className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
        >
          {isLastStep ? '查看推荐结果 →' : '下一步'}
        </button>
      </div>
    </div>
  )
}

function OptionCard({
  selected,
  onClick,
  children,
}: Readonly<{ selected: boolean; onClick: () => void; children: React.ReactNode }>) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all ${
        selected
          ? 'border-amber-500 bg-amber-50 text-amber-900'
          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
      }`}
    >
      {children}
    </button>
  )
}

function StepTitle({ children, hint }: Readonly<{ children: React.ReactNode; hint?: string }>) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-serif font-bold text-slate-900">{children}</h2>
      {hint && <p className="text-slate-400 text-xs mt-1">{hint}</p>}
    </div>
  )
}

function Step1({
  value,
  onChange,
}: Readonly<{ value: Tenure | null; onChange: (v: Tenure) => void }>) {
  const options: { value: Tenure; label: string; sub: string }[] = [
    { value: 'lt1', label: '不到 1 年', sub: '新移民，需要新移民专属卡' },
    { value: '1to3', label: '1 – 3 年', sub: '正在建立信用中' },
    { value: 'gt3', label: '3 年以上', sub: '信用记录较完善' },
  ]
  return (
    <div>
      <StepTitle>你来加拿大多久了？</StepTitle>
      <div className="space-y-3">
        {options.map(o => (
          <OptionCard key={o.value} selected={value === o.value} onClick={() => onChange(o.value)}>
            <span className="font-semibold">{o.label}</span>
            <span className="text-slate-500 ml-2">— {o.sub}</span>
          </OptionCard>
        ))}
      </div>
    </div>
  )
}

function Step2({
  value,
  onChange,
}: Readonly<{ value: SpendCategory[]; onChange: (v: SpendCategory[]) => void }>) {
  const options: { value: SpendCategory; label: string; icon: string }[] = [
    { value: 'groceries', label: '食品杂货（超市买菜）', icon: '🛒' },
    { value: 'dining', label: '餐厅外卖（饭馆、DoorDash）', icon: '🍜' },
    { value: 'travel', label: '旅行机票（常回国或出差）', icon: '✈️' },
    { value: 'gas', label: '开车加油（通勤族）', icon: '⛽' },
    { value: 'shopping', label: '网购（Amazon、海外购物）', icon: '📦' },
    { value: 'bills', label: '手机账单（水电网络订阅）', icon: '📱' },
    { value: 'housing', label: '房租 / 房贷', icon: '🏠' },
  ]

  function toggle(v: SpendCategory) {
    if (value.includes(v)) onChange(value.filter(x => x !== v))
    else onChange([...value, v])
  }

  return (
    <div>
      <StepTitle hint="可多选，按消费金额从高到低选">每月花费最多的类别？</StepTitle>
      <div className="space-y-3">
        {options.map(o => (
          <OptionCard key={o.value} selected={value.includes(o.value)} onClick={() => toggle(o.value)}>
            <span className="mr-2">{o.icon}</span>
            {o.label}
            {value.includes(o.value) && (
              <span className="float-right text-amber-500">✓</span>
            )}
          </OptionCard>
        ))}
      </div>
    </div>
  )
}

function Step3Grocery({
  value,
  onChange,
}: Readonly<{ value: GroceryStore; onChange: (v: GroceryStore) => void }>) {
  const options: { value: GroceryStore; label: string; sub: string; icon: string }[] = [
    { value: 'costco', label: 'Costco 为主', sub: 'Costco 只收 Mastercard，会影响推荐', icon: '🏪' },
    { value: 'sobeys', label: 'Sobeys 系为主', sub: 'Sobeys / IGA / FreshCo / Safeway', icon: '🥦' },
    { value: 'other', label: '其他超市', sub: 'T&T / No Frills / Walmart / Loblaws 等', icon: '🛒' },
  ]
  return (
    <div>
      <StepTitle hint="不同超市接受的信用卡网络不同，影响推荐结果">
        你主要在哪里买菜？
      </StepTitle>
      <div className="space-y-3">
        {options.map(o => (
          <OptionCard key={o.value} selected={value === o.value} onClick={() => onChange(o.value)}>
            <span className="mr-2">{o.icon}</span>
            <span className="font-semibold">{o.label}</span>
            <span className="text-slate-500 ml-2">— {o.sub}</span>
          </OptionCard>
        ))}
      </div>
    </div>
  )
}

function Step4Credit({
  value,
  onChange,
}: Readonly<{ value: CreditStatus | null; onChange: (v: CreditStatus) => void }>) {
  const options: { value: CreditStatus; label: string; sub: string }[] = [
    { value: 'none', label: '完全没有', sub: '需要新移民免审核卡' },
    { value: 'new', label: '刚开始建立', sub: '不到 12 个月' },
    { value: 'established', label: '有一定记录', sub: '12 个月以上' },
  ]
  return (
    <div>
      <StepTitle>你目前在加拿大有信用记录吗？</StepTitle>
      <div className="space-y-3">
        {options.map(o => (
          <OptionCard key={o.value} selected={value === o.value} onClick={() => onChange(o.value)}>
            <span className="font-semibold">{o.label}</span>
            <span className="text-slate-500 ml-2">— {o.sub}</span>
          </OptionCard>
        ))}
      </div>
    </div>
  )
}

function Step5Income({
  value,
  onChange,
}: Readonly<{ value: IncomeLevel | null; onChange: (v: IncomeLevel) => void }>) {
  const options: { value: IncomeLevel; label: string; sub: string }[] = [
    { value: 'low', label: '$4 万以下', sub: '学生 / 兼职' },
    { value: 'mid', label: '$4 – 8 万', sub: '普通全职' },
    { value: 'high', label: '$8 万以上', sub: '可申请高端卡' },
  ]
  return (
    <div>
      <StepTitle hint="部分高端卡有最低收入要求">税前年收入大概是多少？</StepTitle>
      <div className="space-y-3">
        {options.map(o => (
          <OptionCard key={o.value} selected={value === o.value} onClick={() => onChange(o.value)}>
            <span className="font-semibold">{o.label}</span>
            <span className="text-slate-500 ml-2">— {o.sub}</span>
          </OptionCard>
        ))}
      </div>
    </div>
  )
}

function Step6MonthlySpend({
  value,
  onChange,
}: Readonly<{ value: MonthlySpend | null; onChange: (v: MonthlySpend) => void }>) {
  const options: { value: MonthlySpend; label: string; sub: string }[] = [
    { value: 'lt1500', label: '$1500 以下', sub: '月均消费较少' },
    { value: '1500to3000', label: '$1500 – $3000', sub: '普通家庭月支出' },
    { value: 'gt3000', label: '$3000 以上', sub: '消费较多，高年费卡更划算' },
  ]
  return (
    <div>
      <StepTitle hint="用于判断有年费的卡是否值得办">每月信用卡总消费大概多少？</StepTitle>
      <div className="space-y-3">
        {options.map(o => (
          <OptionCard key={o.value} selected={value === o.value} onClick={() => onChange(o.value)}>
            <span className="font-semibold">{o.label}</span>
            <span className="text-slate-500 ml-2">— {o.sub}</span>
          </OptionCard>
        ))}
      </div>
    </div>
  )
}

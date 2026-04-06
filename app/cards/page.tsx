import Link from 'next/link'
import { CARDS } from '@/lib/cards'
import { Card } from '@/lib/types'

const CATEGORY_LABEL: Record<string, string> = {
  newcomer: '新移民专属',
  'no-fee': '无年费日常',
  cashback: '现金返还',
  travel: '旅行积分',
  premium: '高端卡',
}

const CATEGORY_ORDER = ['newcomer', 'no-fee', 'cashback', 'travel', 'premium']

const REWARD_LABEL: Record<string, string> = {
  groceries: '超市', dining: '餐厅', travel: '旅行',
  gas: '加油', shopping: '网购', bills: '账单', housing: '房租',
}

const NETWORK_STYLE: Record<string, string> = {
  Visa: 'bg-blue-100 text-blue-700',
  Mastercard: 'bg-red-100 text-red-700',
  Amex: 'bg-slate-100 text-slate-700',
}

function PoolCard({ card }: Readonly<{ card: Card }>) {
  const bonusRewards = Object.entries(card.rewards)
    .filter(([k, v]) => k !== 'base' && v !== undefined && v > card.rewards.base)
    .sort(([, a], [, b]) => (b as number) - (a as number)) as [string, number][]

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 flex items-start justify-between gap-2" style={{ backgroundColor: '#0f172a' }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${NETWORK_STYLE[card.network] ?? 'bg-slate-100 text-slate-700'}`}>
              {card.network}
            </span>
            {card.newcomerProgram && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium">新移民</span>
            )}
            {card.noForeignFee && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">免外币费</span>
            )}
            {card.sobeysBonus && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 font-medium">Sobeys+</span>
            )}
          </div>
          <h3 className="text-white font-semibold text-sm leading-snug">{card.nameZh}</h3>
          <p className="text-slate-400 text-xs mt-0.5 truncate">{card.nameEn}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-slate-400 text-xs">{card.issuer}</p>
          <p className="text-white text-sm font-semibold mt-0.5">
            {card.annualFee === 0 ? '免年费' : `$${card.annualFee}/年`}
          </p>
        </div>
      </div>

      {/* Rewards */}
      <div className="px-4 py-3 flex-1">
        <div className="flex flex-wrap gap-1.5 mb-3">
          {bonusRewards.map(([cat, rate]) => (
            <span key={cat} className="inline-flex items-center gap-1 text-xs bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-2 py-0.5 font-medium">
              {REWARD_LABEL[cat]} <span className="font-bold">{rate}x</span>
            </span>
          ))}
          <span className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-500 rounded-lg px-2 py-0.5">
            其他 {card.rewards.base}x
          </span>
        </div>

        {card.minIncome > 0 && (
          <p className="text-xs text-slate-400 mb-2">最低年收入 ${(card.minIncome / 1000).toFixed(0)}k</p>
        )}
      </div>

      {/* Apply */}
      <div className="px-4 pb-4">
        <a
          href={card.applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors"
        >
          申请 →
        </a>
      </div>
    </div>
  )
}

export default function CardsPage() {
  const grouped = CATEGORY_ORDER.map(cat => ({
    cat,
    cards: CARDS.filter(c => c.category === cat),
  }))

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-baseline gap-2">
          <Link href="/" className="font-serif font-bold text-xl text-slate-900 hover:opacity-80">
            刷哪张
          </Link>
          <span className="text-slate-400 text-sm">卡库总览</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8 space-y-10">
        <div className="flex items-baseline justify-between">
          <h1 className="font-serif font-bold text-2xl text-slate-900">卡库总览</h1>
          <span className="text-slate-400 text-sm">共 {CARDS.length} 张</span>
        </div>

        {grouped.map(({ cat, cards }) => (
          <section key={cat}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="font-semibold text-slate-900">{CATEGORY_LABEL[cat]}</h2>
              <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{cards.length} 张</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cards.map(card => (
                <PoolCard key={card.id} card={card} />
              ))}
            </div>
          </section>
        ))}
      </main>

      <footer className="text-center text-slate-400 text-xs py-6 px-4">
        <p>推荐仅供参考，请以各银行官网为准。</p>
      </footer>
    </div>
  )
}

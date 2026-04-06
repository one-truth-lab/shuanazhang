import Link from 'next/link'
import CardItem from './CardItem'
import { Recommendation } from '@/lib/types'

interface ResultsProps {
  recommendations: Recommendation[]
  comboTip: string
}

export default function Results({ recommendations, comboTip }: Readonly<ResultsProps>) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-2xl font-serif font-bold text-slate-900">你的专属推荐</p>
        <p className="text-slate-500 text-sm mt-1">
          根据你的情况筛选出 {recommendations.length} 张最适合的信用卡
        </p>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, i) => (
          <CardItem
            key={rec.card.id}
            rank={i + 1}
            nameEn={rec.card.nameEn}
            nameZh={rec.card.nameZh}
            annualFee={rec.card.annualFee}
            network={rec.card.network}
            issuer={rec.card.issuer}
            highlights={rec.card.highlights}
            reason={rec.reason}
            applyUrl={rec.card.applyUrl}
          />
        ))}
      </div>

      {/* Combo tip */}
      <div className="bg-slate-900 rounded-2xl p-5">
        <p className="text-amber-400 text-xs font-semibold mb-2 tracking-wide">💡 组合建议</p>
        <p className="text-slate-200 text-sm leading-relaxed">{comboTip}</p>
      </div>

      <Link
        href="/"
        className="block w-full text-center py-3 rounded-xl border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-100 transition-colors"
      >
        重新填写问卷
      </Link>
    </div>
  )
}

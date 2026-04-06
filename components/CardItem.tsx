interface CardItemProps {
  nameEn: string
  nameZh: string
  annualFee: number
  network: string
  issuer: string
  highlights: string[]
  reason: string
  applyUrl: string
  rank: number
}

const networkBadge: Record<string, string> = {
  Visa: 'bg-blue-100 text-blue-700',
  Mastercard: 'bg-red-100 text-red-700',
  Amex: 'bg-slate-100 text-slate-700',
}

export default function CardItem({
  nameEn,
  nameZh,
  annualFee,
  network,
  issuer,
  highlights,
  reason,
  applyUrl,
  rank,
}: Readonly<CardItemProps>) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="px-5 py-4 flex items-start justify-between gap-3"
           style={{ backgroundColor: '#0f172a' }}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            {rank === 1 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white font-semibold">
                最适合你
              </span>
            )}
            {rank > 1 && (
              <span className="text-amber-400 text-xs font-semibold tracking-widest">#{rank}</span>
            )}
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${networkBadge[network] ?? 'bg-slate-100 text-slate-700'}`}>
              {network}
            </span>
          </div>
          <h3 className="text-white font-semibold text-base leading-snug">{nameZh}</h3>
          <p className="text-slate-400 text-xs mt-0.5">{nameEn}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-slate-400 text-xs">{issuer}</p>
          <p className="text-white text-sm font-medium mt-0.5">
            {annualFee === 0 ? '免年费' : `$${annualFee}/年`}
          </p>
        </div>
      </div>

      {/* Reason */}
      <div className="px-5 pt-4 pb-0">
        <p className="text-sm text-slate-600 leading-relaxed bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          {reason}
        </p>
      </div>

      {/* Highlights */}
      <div className="px-5 pt-3 pb-4">
        <ul className="space-y-1.5 mb-4">
          {highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
              <span className="text-amber-500 mt-0.5 shrink-0">✦</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>

        <a
          href={applyUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
        >
          立即申请 →
        </a>
      </div>
    </div>
  )
}

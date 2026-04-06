import Link from 'next/link'
import Quiz from '@/components/Quiz'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-4">
        <div className="max-w-lg mx-auto flex items-baseline justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-serif font-bold text-xl text-slate-900">刷哪张</span>
            <span className="text-slate-400 text-sm">加拿大信用卡推荐</span>
          </div>
          <Link href="/cards" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            卡库总览 →
          </Link>
        </div>
      </header>

      <main className="flex-1 w-full max-w-lg mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="font-serif font-bold text-3xl text-slate-900 leading-tight">
              找到最适合你的<br />加拿大信用卡
            </h1>
            <p className="text-slate-500 text-sm mt-2">
              4 个问题，精准匹配 · 结果秒出
            </p>
          </div>
          <Quiz />
        </div>
      </main>

      <footer className="text-center text-slate-400 text-xs py-6 px-4">
        <p>推荐仅供参考，请以各银行官网为准。申请链接含推广追踪。</p>
      </footer>
    </div>
  )
}

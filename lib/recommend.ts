import { CARDS } from './cards'
import { Answers, Card, Recommendation } from './types'

const INCOME_MAP = { low: 40000, mid: 80000, high: 999999 }
// 月均消费额（用于年费回本判断）
const MONTHLY_SPEND_MAP = { lt1500: 1500, '1500to3000': 3000, gt3000: 5000 }

// Step 1: 硬过滤
export function filterCards(answers: Answers): Card[] {
  const maxIncome = INCOME_MAP[answers.income]
  const monthlyAmt = MONTHLY_SPEND_MAP[answers.monthlySpend]

  return CARDS.filter(card => {
    if (answers.credit === 'none' && card.requiresCreditHistory) return false
    if (answers.credit === 'new' && card.minIncome > 60000) return false
    if (card.minIncome > maxIncome) return false
    // 高年费卡：月消费不足以回本则直接过滤
    // 简单判断：年费 / 12 > 月消费 * 平均回报率差值（保守 1%）才过滤
    if (card.annualFee > 0 && monthlyAmt * 12 * 0.01 < card.annualFee * 0.5) return false
    return true
  })
}

// Step 2: 算分
export function scoreCard(card: Card, answers: Answers): number {
  let score = 0
  const shopsCostco = answers.groceryStore === 'costco'
  const shopsSobeys = answers.groceryStore === 'sobeys'

  answers.spending.forEach(cat => {
    let rate = card.rewards[cat] ?? card.rewards.base

    if (cat === 'groceries' && shopsCostco && card.network !== 'Mastercard') {
      rate = 0
    }
    if (cat === 'groceries' && shopsSobeys && card.sobeysBonus) {
      rate += 0.5
    }

    score += rate
  })

  // 年费惩罚：月消费越低，年费惩罚越重
  const monthlyAmt = MONTHLY_SPEND_MAP[answers.monthlySpend]
  let feeWeight = 0.2
  if (monthlyAmt < 2000) feeWeight = 0.8
  else if (monthlyAmt < 4000) feeWeight = 0.4
  score -= card.annualFee * feeWeight / 100

  // 加分项
  if (answers.spending.includes('travel') && card.noForeignFee) score += 1.5
  if (answers.tenure === 'lt1' && card.newcomerProgram) score += 2
  if (answers.income === 'low' && card.annualFee === 0) score += 1
  if (answers.spending.includes('housing') && (card.rewards.housing ?? 0) > card.rewards.base) score += 1

  return score
}

// Step 3: 生成推荐理由
export function generateReason(card: Card, answers: Answers): string {
  const categoryLabel: Record<string, string> = {
    groceries: '买菜', dining: '吃饭/外卖', travel: '旅行',
    gas: '加油', shopping: '网购', bills: '日常账单', housing: '房租/房贷',
  }

  const shopsCostco = answers.groceryStore === 'costco'
  const shopsSobeys = answers.groceryStore === 'sobeys'
  const monthlyAmt = MONTHLY_SPEND_MAP[answers.monthlySpend]

  const topCat = answers.spending[0]
  let rate = topCat ? (card.rewards[topCat] ?? card.rewards.base) : card.rewards.base

  if (topCat === 'groceries' && shopsCostco && card.network !== 'Mastercard') {
    rate = card.rewards.base
  }

  const feeNote = card.annualFee === 0
    ? '零年费没有风险'
    : `年费 $${card.annualFee}，以你的月均消费 $${monthlyAmt} 估算年回报约 $${Math.round(monthlyAmt * 12 * rate / 100)}`

  const newcomerNote = card.newcomerProgram
    ? '无需加拿大信用记录，新移民可直接申请。' : ''

  const fxNote = card.noForeignFee && answers.spending.includes('travel')
    ? '无外币手续费，回国购物或买机票不多付2.5%。' : ''

  const costcoNote = shopsCostco && card.network !== 'Mastercard'
    ? `注意：此卡为 ${card.network}，Costco 不接受，需搭配 Mastercard 副卡。` : ''

  const sobeysNote = shopsSobeys && card.sobeysBonus
    ? 'Sobeys / IGA / FreshCo / Safeway 有额外积分加成。' : ''

  const rateNote = topCat && rate > 0 ? `${categoryLabel[topCat]}消费返 ${rate}x，` : ''

  return `${newcomerNote}${rateNote}${feeNote}。${fxNote}${sobeysNote}${costcoNote}`.trim()
}

// Step 4: 多样性过滤——每个发卡行最多出现 1 张
function diversify(scored: Recommendation[]): Recommendation[] {
  const seenIssuers = new Set<string>()
  const result: Recommendation[] = []

  for (const item of scored) {
    if (!seenIssuers.has(item.card.issuer)) {
      seenIssuers.add(item.card.issuer)
      result.push(item)
    }
    if (result.length === 3) break
  }

  // 不足 3 张时：优先不同发卡行补位
  if (result.length < 3) {
    for (const item of scored) {
      if (!result.some(r => r.card.id === item.card.id) && !seenIssuers.has(item.card.issuer)) {
        seenIssuers.add(item.card.issuer)
        result.push(item)
      }
      if (result.length === 3) break
    }
  }
  // 仍不足时才允许同发卡行补位
  if (result.length < 3) {
    for (const item of scored) {
      if (!result.some(r => r.card.id === item.card.id)) {
        result.push(item)
      }
      if (result.length === 3) break
    }
  }

  return result
}

// 主入口
export function getRecommendations(answers: Answers): Recommendation[] {
  const eligible = filterCards(answers)
  const scored = eligible
    .map(card => ({
      card,
      score: scoreCard(card, answers),
      reason: generateReason(card, answers),
    }))
    .sort((a, b) => b.score - a.score)

  // 无信用记录：只推 1 张新移民主卡
  if (answers.credit === 'none') {
    const top = scored[0]
    return top ? [top] : []
  }

  return diversify(scored)
}

function costcoTip(recs: Recommendation[]): string {
  const amexName = recs.find(r => r.card.network === 'Amex')?.card.nameZh ?? 'Amex 卡'
  const nonAmex = recs.find(r => r.card.network !== 'Amex')?.card.nameZh
  if (nonAmex) {
    return `组合建议：${amexName}用于日常餐厅超市积分，${nonAmex}用于 Costco（Costco 不接受 Amex），两卡分工明确。`
  }
  return `注意：Costco 只收 Mastercard / Visa，推荐的 ${amexName} 在 Costco 无法使用，建议在 Costco 使用现金或 Debit 付款。`
}

function amexOnlyTip(recs: Recommendation[]): string {
  const amexName = recs.find(r => r.card.network === 'Amex')?.card.nameZh ?? 'Amex 卡'
  const visaCard = recs.find(r => r.card.network === 'Visa')?.card.nameZh
  if (visaCard) {
    return `组合建议：${amexName}积分率高，${visaCard}覆盖不接受 Amex 的场所，两卡互补。`
  }
  return `提示：${amexName}部分小商家不接受，遇到不支持 Amex 的场所可使用 Debit 卡付款。`
}

function multiCardTip(recs: Recommendation[]): string {
  const mainCard = recs[0].card
  const subCard = recs[1].card
  const main = mainCard.nameZh
  const sub = subCard.nameZh
  if (mainCard.category === 'travel' && subCard.category === 'cashback') {
    return `组合建议：${main}积累旅行积分，${sub}用于日常现金返还，攒里程与省钱两不误。`
  }
  if (mainCard.category === 'travel' && subCard.category === 'no-fee') {
    return `组合建议：${main}作为主力积分卡，${sub}免年费无压力，两卡网络互补覆盖所有消费场景。`
  }
  return `组合建议：${main}是你的主力卡，${sub}作为补充，覆盖${main}不适用的场景。`
}

// 组合建议——只基于推荐出来的卡，不提推荐列表以外的卡
export function getComboTip(answers: Answers, recs: Recommendation[]): string {
  const networks = new Set(recs.map(r => r.card.network))
  const hasAmex = networks.has('Amex')
  const hasMastercard = networks.has('Mastercard')
  const topName = recs[0]?.card.nameZh ?? '以上推荐卡'

  if (recs.every(r => r.card.newcomerProgram)) {
    return `建议：用${topName}起步建立信用记录，新移民卡功能相近，同时办多张意义不大。满 12 个月后再升级到积分卡，回报会大幅提升。`
  }
  if (answers.credit === 'none') {
    return `建议：先用${topName}建立 12 个月信用记录，之后再申请高回报卡。`
  }
  if (answers.groceryStore === 'costco' && hasAmex && !hasMastercard) {
    return costcoTip(recs)
  }
  if (hasAmex && !hasMastercard) {
    return amexOnlyTip(recs)
  }
  if (recs.length >= 2) {
    return multiCardTip(recs)
  }
  return `小贴士：${topName}最适合你当前情况，稳定使用 12 个月后可评估是否升级。`
}

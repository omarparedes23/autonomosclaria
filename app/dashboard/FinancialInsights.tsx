import { getYearInvoices } from '@/lib/actions/invoices'

// ─── Pure calculation helpers ────────────────────────────────────────────────

interface QuarterInfo {
  quarter: number
  label: string
  startMonth: number  // 1-based
  endMonth: number    // 1-based
  quarterEnd: Date
  daysLeft: number
  progress: number    // 0-100
}

function getQuarterInfo(now: Date): QuarterInfo {
  const month = now.getMonth() + 1
  const quarter = Math.ceil(month / 3)
  const startMonth = (quarter - 1) * 3 + 1  // 1, 4, 7, 10
  const endMonth = quarter * 3              // 3, 6, 9, 12

  // Last day of the quarter's last month
  const quarterEnd = new Date(now.getFullYear(), endMonth, 0)
  quarterEnd.setHours(23, 59, 59, 0)

  const quarterStart = new Date(now.getFullYear(), startMonth - 1, 1)

  const totalMs = quarterEnd.getTime() - quarterStart.getTime()
  const elapsedMs = now.getTime() - quarterStart.getTime()
  const remainingMs = quarterEnd.getTime() - now.getTime()

  const daysLeft = Math.max(0, Math.ceil(remainingMs / 86_400_000))
  const progress = Math.min(100, Math.round((elapsedMs / totalMs) * 100))

  return {
    quarter,
    label: `Q${quarter}`,
    startMonth,
    endMonth,
    quarterEnd,
    daysLeft,
    progress,
  }
}

// Spanish IRPF 2024 progressive tramos
const IRPF_TRAMOS = [
  { limit: 12_450, rate: 0.19 },
  { limit: 20_200, rate: 0.24 },
  { limit: 35_200, rate: 0.30 },
  { limit: 60_000, rate: 0.37 },
  { limit: Infinity, rate: 0.45 },
]

function calcIrpf(baseEuros: number): { tax: number; marginalRate: number } {
  let tax = 0
  let prev = 0
  let marginalRate = IRPF_TRAMOS[0].rate
  for (const { limit, rate } of IRPF_TRAMOS) {
    if (baseEuros <= prev) break
    const chunk = Math.min(baseEuros, limit) - prev
    tax += chunk * rate
    marginalRate = rate
    prev = limit
    if (baseEuros <= limit) break
  }
  return { tax, marginalRate }
}

function formatEur(euros: number) {
  return euros.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })
}

// ─── Component ───────────────────────────────────────────────────────────────

export default async function FinancialInsights() {
  const now = new Date()
  const currentYear = now.getFullYear()
  const qi = getQuarterInfo(now)

  const yearInvoices = await getYearInvoices(currentYear)

  // Quarterly IVA — both pending and paid count
  const quarterInvoices = yearInvoices.filter(inv => {
    const m = new Date(inv.issue_date).getMonth() + 1
    return m >= qi.startMonth && m <= qi.endMonth
  })
  const quarterIvaCents = quarterInvoices.reduce((acc, inv) => acc + inv.iva_quota_cents, 0)
  const quarterIvaEur = quarterIvaCents / 100

  // Annual base for IRPF
  const annualBaseCents = yearInvoices.reduce((acc, inv) => acc + inv.taxable_base_cents, 0)
  const annualBaseEur = annualBaseCents / 100
  const { tax: irpfEur, marginalRate } = calcIrpf(annualBaseEur)

  const showAlert = qi.daysLeft <= 15

  return (
    <div className="mb-12 space-y-4">
      <h2 className="text-xl font-bold">Información Fiscal</h2>

      {/* Alert banner */}
      {showAlert && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl px-5 py-4">
          <span className="text-xl">⚠️</span>
          <p className="text-sm font-medium">
            Declaración trimestral en{' '}
            <span className="font-bold">{qi.daysLeft} {qi.daysLeft === 1 ? 'día' : 'días'}</span>
            {' '}— IVA a pagar:{' '}
            <span className="font-bold">{formatEur(quarterIvaEur)}</span>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quarterly IVA Simulator */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Simulador IVA Trimestral</h3>
            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {qi.label} {currentYear}
            </span>
          </div>

          <div>
            <p className="text-2xl font-bold text-gray-900">{formatEur(quarterIvaEur)}</p>
            <p className="text-sm text-gray-500 mt-0.5">de IVA acumulado este trimestre</p>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{qi.progress}% del trimestre transcurrido</span>
              <span>{qi.daysLeft} días restantes</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  qi.progress >= 85 ? 'bg-red-500' :
                  qi.progress >= 65 ? 'bg-amber-400' :
                  'bg-black'
                }`}
                style={{ width: `${qi.progress}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-gray-400">
            Incluye facturas pendientes y pagadas del trimestre.
          </p>
        </div>

        {/* Annual IRPF Tracker */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Estimación IRPF Anual</h3>
            <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
              {currentYear}
            </span>
          </div>

          <div>
            <p className="text-2xl font-bold text-gray-900">{formatEur(irpfEur)}</p>
            <p className="text-sm text-gray-500 mt-0.5">IRPF estimado (tramos progresivos)</p>
          </div>

          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Base imponible anual</span>
              <span className="font-semibold">{formatEur(annualBaseEur)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tramo marginal actual</span>
              <span className={`font-bold ${
                marginalRate >= 0.37 ? 'text-red-600' :
                marginalRate >= 0.30 ? 'text-amber-600' :
                'text-gray-900'
              }`}>
                {(marginalRate * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Tramos reference */}
          <div className="grid grid-cols-5 gap-1 pt-1">
            {IRPF_TRAMOS.map(({ rate }, i) => {
              const isActive = rate === marginalRate
              return (
                <div
                  key={rate}
                  title={`${(rate * 100).toFixed(0)}%`}
                  className={`h-1.5 rounded-full ${
                    isActive ? 'bg-black' : 'bg-gray-200'
                  }`}
                />
              )
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>19%</span>
            <span>24%</span>
            <span>30%</span>
            <span>37%</span>
            <span>45%</span>
          </div>

          <p className="text-xs text-gray-400">
            Estimación orientativa basada en tramos IRPF 2024.
          </p>
        </div>
      </div>
    </div>
  )
}

'use client'
import { AlertTriangle, CheckCircle, Layers, User, GitMerge, Brain, Zap, Activity, TrendingUp, Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell } from 'recharts'
import { useCountUp } from '@/lib/useCountUp'

const MODEL_META = {
  densenet:     { label: 'DenseNet121',    short: 'DenseNet', icon: Layers,   color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  resnet:       { label: 'ResNet3D',       short: 'ResNet',   icon: Brain,    color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  efficientnet: { label: 'EfficientNet3D', short: 'EffNet',   icon: Zap,      color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
}

const PANEL = '#eef3fb'
const commonTooltip = { background: '#eef3fb', border: '1px solid #bfcde6', borderRadius: 6, fontSize: 11 }

export default function ResultPanel({ result, patient }) {
  const isCancer   = result.prediction === 'Cancerous'
  const rawConf    = result.confidence ?? 0
  const confidence = (rawConf * 100).toFixed(1)
  const isEnsemble = result.ensemble && result.models_used?.length > 1
  const hasModels  = result.models && Object.keys(result.models).length > 0

  const risk      = isCancer ? (rawConf >= 0.80 ? 'High Risk' : 'Moderate Risk') : 'Low Risk'
  const mainColor = isCancer ? (rawConf >= 0.80 ? '#dc2626' : '#d97706') : '#16a34a'
  const mainBg    = isCancer ? (rawConf >= 0.80 ? '#fef2f2' : '#fffbeb') : '#f0fdf4'
  const mainBorder = isCancer ? (rawConf >= 0.80 ? '#fecaca' : '#fde68a') : '#bbf7d0'

  const animatedConf = useCountUp(parseFloat(confidence), 1500, true)
  const chartData = hasModels
    ? Object.entries(result.models).map(([name, m]) => ({
        name: MODEL_META[name]?.short || name,
        prob: parseFloat((m.cancer_prob * 100).toFixed(1)),
        color: MODEL_META[name]?.color || '#2563eb',
      }))
    : []

  const ChartTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    const d = payload[0].payload
    return (
      <div className="bg-surface border border-border rounded-lg px-3 py-2 text-xs shadow">
        <p className="font-semibold text-textprimary">{d.name}</p>
        <p className="mt-0.5" style={{ color: d.color }}>Cancer Prob: {d.prob}%</p>
      </div>
    )
  }

  return (
    <div id="result-panel" className="space-y-4 animate-fade-in">

      {/* ── Patient info strip ── */}
      <div className="flex items-center gap-4 px-4 py-3 rounded-xl border border-border flex-wrap" style={{ background: PANEL }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full gradient-blue flex items-center justify-center flex-shrink-0">
            <User size={12} className="text-white" />
          </div>
          <div>
            <p className="text-textprimary font-semibold text-sm leading-tight">{patient?.patient_name || '—'}</p>
            <p className="text-muted text-[10px] font-mono">{patient?.patient_id || '—'}</p>
          </div>
        </div>
        {[
          { label: 'Age',       value: patient?.age || '—' },
          { label: 'Gender',    value: patient?.gender || '—' },
          { label: 'Scan Date', value: patient?.scan_date || '—' },
          { label: 'Slices',    value: result.total_slices },
          { label: 'Threshold', value: `${(result.threshold * 100).toFixed(0)}%` },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center px-3 border-l border-border">
            <span className="text-[10px] text-muted">{label}</span>
            <span className="text-xs font-semibold text-textprimary mt-0.5">{value}</span>
          </div>
        ))}
        {isEnsemble && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 ml-auto">
            <GitMerge size={11} className="text-primary" />
            <span className="text-[10px] font-semibold text-primary">Ensemble · {result.models_used.length} Models</span>
          </div>
        )}
      </div>

      {/* ── Main verdict ── */}
      <div className="rounded-xl border-2 p-5" style={{ background: mainBg, borderColor: mainBorder }}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: mainColor }}>
              {isCancer
                ? <AlertTriangle size={22} className="text-white" />
                : <CheckCircle size={22} className="text-white" />
              }
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-0.5" style={{ color: mainColor }}>
                {isEnsemble ? 'Ensemble Prediction' : 'AI Prediction'}
              </p>
              <h2 className="text-3xl font-bold" style={{ color: mainColor }}>{result.prediction}</h2>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold border-2"
              style={{ color: mainColor, borderColor: mainColor, background: `${mainColor}15` }}>
              {risk}
            </span>
            <p className="text-[10px] text-muted mt-1.5">
              {isEnsemble
                ? `${result.models_used.length} models averaged`
                : MODEL_META[result.models_used?.[0]]?.label || 'DenseNet121'
              }
            </p>
          </div>
        </div>

        {/* Confidence bar */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-medium text-textsub">
              {isEnsemble ? 'Ensemble Confidence' : 'Model Confidence'}
            </span>
            <span className="text-xl font-bold" style={{ color: mainColor }}>{animatedConf}%</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: `${mainColor}20` }}>
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${confidence}%`, background: mainColor }} />
          </div>
        </div>
      </div>

      {/* ── Per-model breakdown ── */}
      {hasModels && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <TrendingUp size={14} className="text-primary" />
            <h3 className="text-textprimary font-semibold text-sm">Per-Model Confidence Breakdown</h3>
          </div>

          <div className="border border-border rounded-xl overflow-hidden" style={{ background: PANEL }}>
            {Object.entries(result.models).map(([name, m], idx, arr) => {
              const meta      = MODEL_META[name] || { label: name, icon: Brain, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' }
              const Icon      = meta.icon
              const mc        = m.prediction === 'Cancerous'
              const conf      = (m.confidence * 100).toFixed(1)
              const prob      = (m.cancer_prob * 100).toFixed(1)
              const diff      = (m.cancer_prob - result.threshold)
              const predColor = mc ? '#dc2626' : '#16a34a'

              return (
                <div key={name} className={`px-5 py-4 ${idx < arr.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: meta.bg }}>
                        <Icon size={14} style={{ color: meta.color }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-textprimary">{meta.label}</p>
                        <p className="text-[10px] text-muted">3D Neural Network</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-textsub">
                        vs Threshold ({(result.threshold * 100).toFixed(0)}%):
                        <span className="ml-1 font-bold" style={{ color: diff >= 0 ? '#dc2626' : '#16a34a' }}>
                          {diff >= 0 ? '▲' : '▼'} {Math.abs(diff * 100).toFixed(1)}%
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
                        style={{ color: predColor, background: mc ? '#fef2f2' : '#f0fdf4', borderColor: mc ? '#fecaca' : '#bbf7d0' }}>
                        {mc ? <AlertTriangle size={8} /> : <CheckCircle size={8} />}
                        {m.prediction}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-muted">Confidence</span>
                        <span className="text-xs font-bold" style={{ color: predColor }}>{conf}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: `${predColor}15` }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${conf}%`, background: predColor }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-muted">Cancer Probability</span>
                        <span className="text-xs font-bold" style={{ color: meta.color }}>{prob}%</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ background: meta.bg }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${prob}%`, background: meta.color }} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Comparison chart (ensemble only) ── */}
      {hasModels && chartData.length > 1 && (
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <Activity size={14} className="text-purple" />
            <h3 className="text-textprimary font-semibold text-sm">Cancer Probability Comparison</h3>
            <span className="text-xs text-muted">— all models vs threshold</span>
          </div>
          <div className="border border-border rounded-xl p-4" style={{ background: PANEL }}>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={chartData} margin={{ top: 4, right: 16, left: -12, bottom: 4 }}>
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(37,99,235,0.04)', radius: 6 }} />
                <ReferenceLine y={result.threshold * 100} stroke="#d97706" strokeDasharray="5 4" strokeWidth={1.5}
                  label={{ value: `Threshold ${(result.threshold * 100).toFixed(0)}%`, fill: '#d97706', fontSize: 10, position: 'insideTopRight' }} />
                <Bar dataKey="prob" radius={[6, 6, 0, 0]} maxBarSize={56}>
                  {chartData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* ── Ensemble agreement banner ── */}
      {isEnsemble && hasModels && (() => {
        const preds       = Object.values(result.models).map(m => m.prediction)
        const allAgree    = preds.every(p => p === preds[0])
        const cancerCount = preds.filter(p => p === 'Cancerous').length
        return (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl border-2"
            style={{ background: allAgree ? '#f0fdf4' : '#fffbeb', borderColor: allAgree ? '#bbf7d0' : '#fde68a' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: allAgree ? '#16a34a' : '#d97706' }}>
              <GitMerge size={15} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: allAgree ? '#15803d' : '#b45309' }}>
                {allAgree
                  ? `All ${preds.length} models agree — ${preds[0]}`
                  : `Models disagree — ${cancerCount} of ${preds.length} predict Cancerous`
                }
              </p>
              <p className="text-xs mt-0.5" style={{ color: allAgree ? '#16a34a' : '#d97706' }}>
                {allAgree
                  ? 'Strong ensemble consensus — high reliability result'
                  : 'Ensemble averages all probabilities for the final decision'
                }
              </p>
            </div>
          </div>
        )
      })()}

      {/* ── Footer ── */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <p className="text-muted text-xs">
          AI-assisted tool only — always consult a qualified medical professional for clinical diagnosis.
        </p>
        <button
          onClick={async () => {
            const { downloadScanReport } = await import('@/lib/pdfReport')
            await downloadScanReport({
              ...patient,
              prediction:    result.prediction,
              confidence:    result.confidence,
              total_slices:  result.total_slices,
              cancer_slices: result.cancer_slices,
              threshold:     result.threshold,
              models_used:   result.models_used?.join(','),
              model_results: result.models ?? null,
              created_at:    new Date().toISOString(),
            })
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md gradient-blue text-white text-xs font-semibold hover:opacity-90 transition-opacity flex-shrink-0 ml-4"
        >
          <Download size={12} /> Download PDF
        </button>
      </div>
    </div>
  )
}

'use client'
import { useScans } from '@/lib/useScans'
import TopBar from '@/components/TopBar'
import Link from 'next/link'
import {
  ScanLine, CheckCircle, AlertTriangle, ArrowRight,
  Layers, Brain, Zap, GitMerge, TrendingUp, Activity, Users, Calendar
} from 'lucide-react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts'
import { useCountUp } from '@/lib/useCountUp'

const COLORS = { Cancerous: '#dc2626', 'Non-Cancerous': '#16a34a' }
const MODEL_META = {
  densenet:     { label: 'DenseNet121',    color: '#2563eb', icon: Layers },
  resnet:       { label: 'ResNet3D',       color: '#7c3aed', icon: Brain },
  efficientnet: { label: 'EfficientNet3D', color: '#ea580c', icon: Zap },
  ensemble:     { label: 'Ensemble',       color: '#16a34a', icon: GitMerge },
}

const PANEL = '#eef3fb'
const commonTooltip = { background: '#eef3fb', border: '1px solid #bfcde6', borderRadius: 6, fontSize: 11, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }

function Skeleton({ className }) {
  return <div className={`bg-gray-100 rounded animate-pulse ${className}`} />
}

function StatCell({ label, value, icon: Icon, gradient, text, loading }) {
  const animated = useCountUp(value, 1000, !loading)
  return (
    <div className="px-5 py-4 flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg ${gradient} flex items-center justify-center flex-shrink-0`}>
        <Icon size={15} className="text-white" />
      </div>
      <div>
        {loading
          ? <Skeleton className="h-6 w-12 mb-0.5" />
          : <p className={`text-xl font-bold ${text}`}>{animated}</p>
        }
        <p className="text-xs text-muted leading-none mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { scans, loading } = useScans()

  const total     = scans.length
  const cancerous = scans.filter(s => s.prediction === 'Cancerous').length
  const safe      = scans.filter(s => s.prediction === 'Non-Cancerous').length
  const patients  = new Set(scans.map(s => s.patient_id)).size
  const recent    = scans.slice(0, 5)

  const pieData = [
    { name: 'Cancerous',     value: cancerous },
    { name: 'Non-Cancerous', value: safe },
  ].filter(d => d.value > 0)

  const modelCount = { densenet: 0, resnet: 0, efficientnet: 0, ensemble: 0 }
  scans.forEach(s => {
    if (!s.models_used) { modelCount.densenet++; return }
    const ms = s.models_used.split(',')
    if (ms.length > 1) modelCount.ensemble++
    ms.forEach(m => { if (modelCount[m] !== undefined) modelCount[m]++ })
  })

  const modelBarData = Object.entries(MODEL_META).map(([key, meta]) => ({
    name: meta.label.replace('3D', '').replace('121', ''),
    count: modelCount[key],
    color: meta.color,
  }))

  const confBuckets = { '0-50': 0, '50-60': 0, '60-70': 0, '70-80': 0, '80-90': 0, '90-100': 0 }
  scans.forEach(s => {
    if (!s.confidence) return
    const p = s.confidence * 100
    if (p < 50) confBuckets['0-50']++
    else if (p < 60) confBuckets['50-60']++
    else if (p < 70) confBuckets['60-70']++
    else if (p < 80) confBuckets['70-80']++
    else if (p < 90) confBuckets['80-90']++
    else confBuckets['90-100']++
  })
  const confData = Object.entries(confBuckets).map(([range, count]) => ({ range, count }))

  const timeData = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const label = d.toLocaleDateString('en', { weekday: 'short' })
    const dayScans = scans.filter(s => new Date(s.created_at).toDateString() === d.toDateString())
    timeData.push({
      day: label,
      total: dayScans.length,
      cancer: dayScans.filter(s => s.prediction === 'Cancerous').length,
      safe: dayScans.filter(s => s.prediction === 'Non-Cancerous').length,
    })
  }

  const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs shadow">
        <p className="font-semibold text-textprimary">{payload[0].name}</p>
        <p style={{ color: COLORS[payload[0].name] }}>{payload[0].value} scans</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-auto bg-bg">
      <TopBar title="Dashboard" subtitle="Analytics overview of all patient scans">
        <Link href="/scan"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors">
          <ScanLine size={13} /> New Scan
        </Link>
      </TopBar>

      <div className="flex-1 p-5 space-y-4 animate-fade-in">

        {/* ── Metrics strip ── */}
        <div className="border border-border rounded-xl overflow-hidden" style={{ background: PANEL }}>
          <div className="grid grid-cols-4 divide-x divide-border">
            <StatCell label="Total Scans"     value={total}     icon={ScanLine}      gradient="gradient-blue"   text="text-primary" loading={loading} />
            <StatCell label="Cancerous"       value={cancerous} icon={AlertTriangle} gradient="gradient-red"    text="text-danger"  loading={loading} />
            <StatCell label="Non-Cancerous"   value={safe}      icon={CheckCircle}   gradient="gradient-green"  text="text-success" loading={loading} />
            <StatCell label="Unique Patients" value={patients}  icon={Users}         gradient="gradient-purple" text="text-purple"  loading={loading} />
          </div>
        </div>

        {/* ── Charts row ── */}
        <div className="border border-border rounded-xl overflow-hidden" style={{ background: PANEL }}>
          <div className="grid grid-cols-3 divide-x divide-border">

            {/* Prediction Distribution */}
            <div className="p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Activity size={12} className="text-muted" />
                <p className="text-xs font-semibold text-textprimary">Prediction Distribution</p>
              </div>
              {loading ? <Skeleton className="h-36 w-full" /> : total === 0 ? (
                <p className="text-center text-muted text-xs py-12">No data yet</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={36} outerRadius={56} paddingAngle={3} dataKey="value">
                        {pieData.map((d, i) => <Cell key={i} fill={COLORS[d.name]} />)}
                      </Pie>
                      <Tooltip content={<PieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-3 mt-1">
                    {pieData.map(d => (
                      <div key={d.name} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ background: COLORS[d.name] }} />
                        <span className="text-[10px] text-textsub">{d.name} ({d.value})</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Model Usage */}
            <div className="p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <TrendingUp size={12} className="text-muted" />
                <p className="text-xs font-semibold text-textprimary">Model Usage</p>
              </div>
              {loading ? <Skeleton className="h-36 w-full" /> : (
                <ResponsiveContainer width="100%" height={148}>
                  <BarChart data={modelBarData} margin={{ top: 4, right: 4, left: -30, bottom: 4 }}>
                    <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={commonTooltip} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={34}>
                      {modelBarData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Confidence Distribution */}
            <div className="p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <Zap size={12} className="text-muted" />
                <p className="text-xs font-semibold text-textprimary">Confidence Distribution</p>
              </div>
              {loading ? <Skeleton className="h-36 w-full" /> : (
                <ResponsiveContainer width="100%" height={148}>
                  <BarChart data={confData} margin={{ top: 4, right: 4, left: -30, bottom: 4 }}>
                    <XAxis dataKey="range" tick={{ fill: '#9ca3af', fontSize: 8 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#9ca3af', fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={commonTooltip} />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>

        {/* ── Timeline ── */}
        <div className="border border-border rounded-xl p-4" style={{ background: PANEL }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <Calendar size={12} className="text-muted" />
              <p className="text-xs font-semibold text-textprimary">Scans — Last 7 Days</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-primary inline-block" /> Total</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-danger inline-block" /> Cancer</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 rounded bg-success inline-block" /> Safe</span>
            </div>
          </div>
          {loading ? <Skeleton className="h-32 w-full" /> : (
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={timeData} margin={{ top: 4, right: 10, left: -30, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="day" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#9ca3af', fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={commonTooltip} />
                <Line type="monotone" dataKey="total"  stroke="#2563eb" strokeWidth={1.5} dot={{ fill: '#2563eb', r: 2.5 }} />
                <Line type="monotone" dataKey="cancer" stroke="#dc2626" strokeWidth={1.5} dot={{ fill: '#dc2626', r: 2.5 }} />
                <Line type="monotone" dataKey="safe"   stroke="#16a34a" strokeWidth={1.5} dot={{ fill: '#16a34a', r: 2.5 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Bottom row ── */}
        <div className="grid grid-cols-3 gap-4">

          {/* Quick action */}
          <Link href="/scan"
            className="flex items-center justify-between p-4 rounded-xl border border-border hover:border-primary/50 transition-all group"
            style={{ background: PANEL }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg gradient-blue flex items-center justify-center">
                <ScanLine size={16} className="text-white" />
              </div>
              <div>
                <p className="text-textprimary font-semibold text-sm">New Scan</p>
                <p className="text-muted text-xs">Upload DICOM files</p>
              </div>
            </div>
            <ArrowRight size={14} className="text-muted group-hover:text-primary transition-colors" />
          </Link>

          {/* Recent scans */}
          <div className="col-span-2 rounded-xl border border-border overflow-hidden" style={{ background: PANEL }}>
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
              <p className="text-xs font-semibold text-textprimary">Recent Scans</p>
              <Link href="/history"
                className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1">
                View all <ArrowRight size={10} />
              </Link>
            </div>
            {loading ? (
              <div className="p-4 space-y-2">{[1,2,3].map(i => <Skeleton key={i} className="h-7 w-full" />)}</div>
            ) : recent.length === 0 ? (
              <p className="text-center text-muted text-xs py-8">No scans yet</p>
            ) : (
              <table className="w-full text-xs">
                <tbody>
                  {recent.map((s, i) => {
                    const isCancer = s.prediction === 'Cancerous'
                    return (
                      <tr key={s.id}
                        className={`border-b border-border/60 transition-colors ${i === recent.length - 1 ? 'border-b-0' : ''}`}
                        onMouseEnter={e => e.currentTarget.style.background = '#dce7f5'}
                        onMouseLeave={e => e.currentTarget.style.background = ''}>
                        <td className="px-4 py-2.5 font-mono font-semibold text-primary">{s.patient_id}</td>
                        <td className="px-4 py-2.5 text-textprimary font-medium">{s.patient_name}</td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${isCancer ? 'bg-red-50 text-danger' : 'bg-green-50 text-success'}`}>
                            {isCancer ? <AlertTriangle size={8} /> : <CheckCircle size={8} />}
                            {s.prediction}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 font-semibold" style={{ color: isCancer ? '#dc2626' : '#16a34a' }}>
                          {s.confidence ? `${(s.confidence * 100).toFixed(1)}%` : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

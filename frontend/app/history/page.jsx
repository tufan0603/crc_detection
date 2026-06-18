'use client'
import { useState } from 'react'
import { useScans } from '@/lib/useScans'
import TopBar from '@/components/TopBar'
import Modal from '@/components/Modal'
import {
  Search, AlertTriangle, CheckCircle, RefreshCw,
  Layers, Brain, Zap, GitMerge, Trash2, BarChart2, Download,
} from 'lucide-react'
import clsx from 'clsx'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis } from 'recharts'

const MODEL_ICONS  = { densenet: Layers, resnet: Brain, efficientnet: Zap }
const MODEL_LABELS = { densenet: 'DenseNet121', resnet: 'ResNet3D', efficientnet: 'EfficientNet3D' }
const MODEL_COLORS = { densenet: '#2563eb', resnet: '#7c3aed', efficientnet: '#ea580c' }

const PANEL = '#eef3fb'
const commonTooltip = { background: '#eef3fb', border: '1px solid #bfcde6', borderRadius: 6, fontSize: 11 }

function Skeleton({ className }) {
  return <div className={`bg-gray-100 rounded animate-pulse ${className}`} />
}

function StatCell({ label, value, color, loading }) {
  return (
    <div className="px-5 py-4 flex items-center gap-3">
      <span className="w-0.5 h-8 rounded-full flex-shrink-0" style={{ background: color }} />
      <div>
        {loading
          ? <Skeleton className="h-6 w-12 mb-0.5" />
          : <p className="text-xl font-bold" style={{ color }}>{value}</p>
        }
        <p className="text-xs text-muted leading-none mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default function HistoryPage() {
  const { scans, loading, refresh } = useScans()
  const [search, setSearch]             = useState('')
  const [filter, setFilter]             = useState('all')
  const [deleteModal, setDeleteModal]   = useState(null)
  const [deleting, setDeleting]         = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(true)

  const handleDelete = async () => {
    if (!deleteModal) return
    setDeleting(true)
    try {
      await fetch(`/api/scans/${deleteModal.id}`, { method: 'DELETE' })
      refresh()
      setDeleteModal(null)
    } catch (e) {
      console.error(e)
    } finally {
      setDeleting(false)
    }
  }

  const filtered = scans
    .filter(s => filter === 'all' || s.prediction === (filter === 'cancer' ? 'Cancerous' : 'Non-Cancerous'))
    .filter(s =>
      s.patient_id?.toLowerCase().includes(search.toLowerCase()) ||
      s.patient_name?.toLowerCase().includes(search.toLowerCase())
    )

  const total     = scans.length
  const cancerous = scans.filter(s => s.prediction === 'Cancerous').length
  const safe      = scans.filter(s => s.prediction === 'Non-Cancerous').length

  const GENDER_COLORS = ['#2563eb', '#ec4899', '#ea580c']
  const genderData = [
    { name: 'Male',   value: scans.filter(s => s.gender === 'Male').length },
    { name: 'Female', value: scans.filter(s => s.gender === 'Female').length },
    { name: 'Other',  value: scans.filter(s => s.gender === 'Other').length },
  ].filter(d => d.value > 0)

  const ageBuckets = { '<30': 0, '30-40': 0, '40-50': 0, '50-60': 0, '60+': 0 }
  scans.forEach(s => {
    if (!s.age) return
    const a = parseInt(s.age)
    if (a < 30) ageBuckets['<30']++
    else if (a < 40) ageBuckets['30-40']++
    else if (a < 50) ageBuckets['40-50']++
    else if (a < 60) ageBuckets['50-60']++
    else ageBuckets['60+']++
  })
  const ageData = Object.entries(ageBuckets).map(([range, count]) => ({ range, count }))

  return (
    <div className="flex flex-col h-full overflow-auto bg-bg">
      <TopBar title="Scan History" subtitle="All past patient scan results with analytics">
        <button onClick={() => setShowAnalytics(v => !v)}
          className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all',
            showAnalytics ? 'bg-primary text-white border-primary' : 'bg-surface border-border text-textsub hover:text-textprimary')}>
          <BarChart2 size={12} /> Analytics
        </button>
        <button onClick={refresh}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border text-textsub hover:text-textprimary text-xs font-semibold transition-colors">
          <RefreshCw size={12} /> Refresh
        </button>
      </TopBar>

      <div className="flex-1 p-5 animate-fade-in space-y-4">

        {/* ── Stats strip ── */}
        <div className="border border-border rounded-xl overflow-hidden" style={{ background: PANEL }}>
          <div className="grid grid-cols-3 divide-x divide-border">
            <StatCell label="Total Scans"   value={total}     color="#2563eb" loading={loading} />
            <StatCell label="Cancerous"     value={cancerous} color="#dc2626" loading={loading} />
            <StatCell label="Non-Cancerous" value={safe}      color="#16a34a" loading={loading} />
          </div>
        </div>

        {/* ── Analytics charts ── */}
        {showAnalytics && (
          <div className="border border-border rounded-xl overflow-hidden" style={{ background: PANEL }}>
            <div className="grid grid-cols-2 divide-x divide-border">
              <div className="p-4">
                <p className="text-xs font-semibold text-textprimary mb-3">Gender Distribution</p>
                {loading ? <Skeleton className="h-36 w-full" /> : genderData.length === 0 ? (
                  <p className="text-center text-muted text-xs py-10">No data</p>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={130}>
                      <PieChart>
                        <Pie data={genderData} cx="50%" cy="50%" outerRadius={52} dataKey="value" paddingAngle={3}>
                          {genderData.map((_, i) => <Cell key={i} fill={GENDER_COLORS[i]} />)}
                        </Pie>
                        <Tooltip contentStyle={commonTooltip} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-3 mt-1">
                      {genderData.map((d, i) => (
                        <div key={d.name} className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full inline-block" style={{ background: GENDER_COLORS[i] }} />
                          <span className="text-[10px] text-textsub">{d.name} ({d.value})</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="p-4">
                <p className="text-xs font-semibold text-textprimary mb-3">Age Distribution</p>
                {loading ? <Skeleton className="h-36 w-full" /> : (
                  <ResponsiveContainer width="100%" height={148}>
                    <BarChart data={ageData} margin={{ top: 4, right: 4, left: -30, bottom: 4 }}>
                      <XAxis dataKey="range" tick={{ fill: '#9ca3af', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#9ca3af', fontSize: 9 }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={commonTooltip} />
                      <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} maxBarSize={38} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Search + Filter ── */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search patient ID or name…"
              className="w-full border border-border rounded-md pl-8 pr-3 py-2 text-sm text-textprimary placeholder-muted focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-colors" style={{ background: PANEL }} />
          </div>
          <div className="flex items-center gap-1.5">
            {[{ key: 'all', label: 'All' }, { key: 'cancer', label: 'Cancerous' }, { key: 'noncancer', label: 'Non-Cancerous' }].map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={clsx('px-3 py-1.5 rounded-md text-xs font-semibold border transition-all',
                  filter === key
                    ? 'bg-primary text-white border-primary'
                    : 'bg-surface border-border text-textsub hover:text-textprimary hover:border-primary/40')}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ── */}
        {loading ? (
          <div className="space-y-2">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-11 w-full" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted text-sm rounded-xl border border-border" style={{ background: PANEL }}>
            {search ? 'No results found.' : 'No scans recorded yet.'}
          </div>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden" style={{ background: PANEL }}>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border" style={{ background: '#dce7f5' }}>
                  {['Patient ID', 'Name', 'Age', 'Gender', 'Scan Date', 'Result', 'Confidence', 'Models', 'Slices', 'Recorded', ''].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-muted font-semibold text-[10px] uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const models   = s.models_used ? s.models_used.split(',') : []
                  const isCancer = s.prediction === 'Cancerous'
                  return (
                    <tr key={s.id}
                      className={`border-b border-border/60 transition-colors ${i === filtered.length - 1 ? 'border-b-0' : ''}`}
                      onMouseEnter={e => e.currentTarget.style.background = '#dce7f5'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}>
                      <td className="px-4 py-3 font-mono font-semibold text-primary">{s.patient_id || '—'}</td>
                      <td className="px-4 py-3 text-textprimary font-medium">{s.patient_name || '—'}</td>
                      <td className="px-4 py-3 text-textsub">{s.age || '—'}</td>
                      <td className="px-4 py-3 text-textsub">{s.gender || '—'}</td>
                      <td className="px-4 py-3 text-textsub whitespace-nowrap">{s.scan_date ? new Date(s.scan_date).toLocaleDateString() : '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${isCancer ? 'bg-red-50 text-danger' : 'bg-green-50 text-success'}`}>
                          {isCancer ? <AlertTriangle size={8} /> : <CheckCircle size={8} />}
                          {s.prediction}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-12 h-1.5 rounded-full overflow-hidden bg-gray-100">
                            <div className={`h-full rounded-full ${isCancer ? 'bg-danger' : 'bg-success'}`}
                              style={{ width: `${s.confidence ? (s.confidence * 100).toFixed(0) : 0}%` }} />
                          </div>
                          <span className={`font-semibold ${isCancer ? 'text-danger' : 'text-success'}`}>
                            {s.confidence ? `${(s.confidence * 100).toFixed(1)}%` : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {models.length > 1
                          ? <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-[10px] font-semibold text-primary w-fit border border-primary/20">
                              <GitMerge size={9} /> Ensemble
                            </span>
                          : models.length === 1
                            ? (() => {
                                const m = models[0]
                                const Icon = MODEL_ICONS[m] || Brain
                                const color = MODEL_COLORS[m] || '#2563eb'
                                return (
                                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border w-fit"
                                    style={{ color, background: `${color}10`, borderColor: `${color}30` }}>
                                    <Icon size={9} />{MODEL_LABELS[m]}
                                  </span>
                                )
                              })()
                          : '—'
                        }
                      </td>
                      <td className="px-4 py-3 text-textsub text-center">{s.total_slices ?? '—'}</td>
                      <td className="px-4 py-3 text-muted whitespace-nowrap">{new Date(s.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={async () => {
                              const { downloadScanReport } = await import('@/lib/pdfReport')
                              await downloadScanReport(s)
                            }}
                            className="w-6 h-6 rounded-md bg-primary/8 border border-primary/20 flex items-center justify-center hover:bg-primary/15 transition-colors"
                            title="Download PDF">
                            <Download size={11} className="text-primary" />
                          </button>
                          <button onClick={() => setDeleteModal(s)}
                            className="w-6 h-6 rounded-md bg-red-50 border border-red-200 flex items-center justify-center hover:bg-red-100 transition-colors"
                            title="Delete">
                            <Trash2 size={11} className="text-danger" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={!!deleteModal} onClose={() => setDeleteModal(null)} title="Delete Scan Record" maxWidth="max-w-sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-red-50 border border-red-200">
            <AlertTriangle size={16} className="text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-danger">This action cannot be undone</p>
              <p className="text-xs text-textsub mt-1">
                Delete scan record for <span className="font-semibold text-textprimary">{deleteModal?.patient_name || deleteModal?.patient_id}</span>?
              </p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setDeleteModal(null)}
              className="flex-1 py-2 rounded-lg border border-border text-textsub text-sm font-semibold hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="flex-1 py-2 rounded-lg bg-danger text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50">
              {deleting ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

'use client'
import { useEffect, useState } from 'react'
import { Upload, FileSearch, Cpu, Brain } from 'lucide-react'

const STAGES = [
  { icon: Upload,     label: 'Uploading DICOM files',  sub: 'Transferring scan data securely',      duration: 2500 },
  { icon: FileSearch, label: 'Parsing patient scan',   sub: 'Reading DICOM metadata & slices',      duration: 3000 },
  { icon: Cpu,        label: 'Preprocessing volume',   sub: 'Normalizing depth to 64 slices',       duration: 3500 },
  { icon: Brain,      label: 'Running AI prediction',  sub: 'Analyzing 3D CT volume',               duration: 0    },
]

export default function AnalysisLoader() {
  const [stageIndex, setStageIndex] = useState(0)
  const [dots, setDots]             = useState('')
  const [progress, setProgress]     = useState(0)

  useEffect(() => {
    let elapsed = 0
    const timers = []
    STAGES.forEach((s, i) => {
      if (s.duration === 0) return
      elapsed += s.duration
      timers.push(setTimeout(() => setStageIndex(i + 1), elapsed))
    })
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 500)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => {
      setProgress(p => { if (p >= 90) { clearInterval(id); return 90 } return p + 1 })
    }, 100)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="fixed inset-0 z-50 backdrop-blur-xl flex items-center justify-center" style={{ background: 'rgba(228, 236, 247, 0.88)' }}>
      <div className="border-2 border-border rounded-3xl p-10 w-full max-w-md shadow-2xl" style={{ background: '#eef3fb' }}>

        {/* Pulse rings */}
        <div className="relative w-20 h-20 mx-auto mb-7">
          {[0,1,2].map(i => (
            <span key={i} className="absolute inset-0 rounded-full border-2 border-primary/30 animate-pulse-ring" style={{ animationDelay: `${i * 0.6}s` }} />
          ))}
          <div className="absolute inset-3 rounded-full gradient-blue flex items-center justify-center shadow-lg">
            <Brain size={22} className="text-white" />
          </div>
        </div>

        <h3 className="text-textprimary font-extrabold text-center text-xl mb-1">Analyzing Patient Scan</h3>
        <p className="text-muted text-center text-xs mb-7">AI-powered 3D cancer detection in progress</p>

        {/* Stages */}
        <div className="space-y-2 mb-7">
          {STAGES.map((s, i) => {
            const done   = i < stageIndex
            const active = i === stageIndex
            const Icon   = s.icon
            return (
              <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-300 ${
                done   ? 'bg-green-50 border-green-200' :
                active ? 'bg-primary/5 border-primary/30 shadow-sm' :
                         'border-border opacity-50'
              }`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  done ? 'bg-success' : active ? 'gradient-blue' : 'bg-border'
                }`}>
                  {done
                    ? <span className="text-white text-sm font-bold">✓</span>
                    : <Icon size={14} className="text-white" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold ${done ? 'text-success' : active ? 'text-primary' : 'text-muted'}`}>
                    {s.label}{active ? dots : ''}
                  </p>
                  <p className="text-xs text-muted truncate">{s.sub}</p>
                </div>
                {active && (
                  <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin-slow flex-shrink-0" />
                )}
              </div>
            )
          })}
        </div>

        {/* Progress */}
        <div>
          <div className="flex justify-between text-xs mb-2">
            <span className="text-textsub font-semibold uppercase tracking-wider">Analysis Progress</span>
            <span className="text-primary font-extrabold text-sm">{progress}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden border border-border" style={{ background: '#d8e3f3' }}>
            <div className="h-full rounded-full shimmer transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <p className="text-center text-muted text-xs mt-5">This may take 1–3 minutes depending on scan size</p>
      </div>
    </div>
  )
}

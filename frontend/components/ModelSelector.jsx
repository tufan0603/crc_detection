'use client'
import { Layers, Brain, Zap, GitMerge } from 'lucide-react'
import clsx from 'clsx'

const MODELS = [
  { id: 'densenet',     label: 'DenseNet121',   desc: '3D Dense connections',   icon: Layers, color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
  { id: 'resnet',       label: 'ResNet3D',       desc: '3D Residual network',    icon: Brain,  color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe' },
  { id: 'efficientnet', label: 'EfficientNet3D', desc: '3D Efficient MBConv',    icon: Zap,    color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
]

export default function ModelSelector({ selected, onChange }) {
  const allSelected = MODELS.every(m => selected.includes(m.id))

  const toggle = (id) => {
    if (selected.includes(id)) {
      if (selected.length === 1) return
      onChange(selected.filter(s => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const toggleAll = () => {
    if (allSelected) onChange(['densenet'])
    else onChange(MODELS.map(m => m.id))
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="w-0.5 h-4 rounded-full bg-purple flex-shrink-0" />
          <h3 className="text-textprimary font-semibold text-sm">Select AI Model</h3>
        </div>
        <button
          onClick={toggleAll}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-all',
            allSelected
              ? 'bg-primary text-white border-primary'
              : 'bg-surface border-border text-textsub hover:border-primary/50 hover:text-primary'
          )}
        >
          <GitMerge size={12} />
          {allSelected ? 'Ensemble ON' : 'Use All (Ensemble)'}
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        {MODELS.map(({ id, label, desc, icon: Icon, color, bg, border }) => {
          const active = selected.includes(id)
          return (
            <button
              key={id}
              onClick={() => toggle(id)}
              className="flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all duration-150"
              style={{
                background:  active ? bg : '#eef3fb',
                borderColor: active ? color : '#e5e7eb',
                boxShadow:   active ? `0 0 0 3px ${color}18` : 'none',
              }}
            >
              <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                style={{ background: active ? color : '#f3f4f6' }}>
                <Icon size={15} style={{ color: active ? 'white' : color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: active ? color : '#111827' }}>{label}</p>
                <p className="text-[10px] text-muted mt-0.5 truncate">{desc}</p>
              </div>
              <div className="w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center"
                style={{ borderColor: active ? color : '#d1d5db', background: active ? color : 'transparent' }}>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
              </div>
            </button>
          )
        })}
      </div>

      {selected.length > 1 && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-md bg-primary/5 border border-primary/20">
          <GitMerge size={12} className="text-primary flex-shrink-0" />
          <p className="text-xs text-primary">
            Ensemble mode — {selected.length} models will run and their probabilities averaged for higher accuracy
          </p>
        </div>
      )}
    </div>
  )
}

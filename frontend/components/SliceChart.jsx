'use client'
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts'

export default function SliceChart({ isCancer, confidence, threshold }) {
  const pct       = parseFloat((confidence * 100).toFixed(1))
  const threshPct = parseFloat((threshold * 100).toFixed(0))
  const color     = isCancer ? '#dc2626' : '#16a34a'

  const data = [{ value: pct, fill: color }]

  return (
    <div className="bg-card border border-border rounded-xl p-5 h-full flex flex-col">
      <h3 className="text-textprimary font-semibold text-sm mb-1">Prediction Confidence</h3>
      <p className="text-muted text-xs mb-4">
        How confident the model is in its {isCancer ? 'Cancerous' : 'Non-Cancerous'} prediction
      </p>

      {/* Radial gauge */}
      <div className="flex-1 flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height={180}>
          <RadialBarChart
            cx="50%" cy="50%"
            innerRadius="65%" outerRadius="90%"
            startAngle={210} endAngle={-30}
            data={data}
          >
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar
              dataKey="value"
              cornerRadius={8}
              background={{ fill: 'rgba(255,255,255,0.04)' }}
            />
          </RadialBarChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-bold" style={{ color }}>{pct}%</span>
          <span className="text-muted text-xs mt-1">{isCancer ? 'Cancer' : 'Safe'}</span>
        </div>
      </div>

      {/* Threshold note */}
      <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-lg bg-bg border border-border">
        <span className="text-muted text-xs">Decision Threshold</span>
        <span className="text-yellow-400 text-xs font-bold">{threshPct}%</span>
      </div>

      <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-lg bg-bg border border-border">
        <span className="text-muted text-xs">Model Decision</span>
        <span className={`text-xs font-bold ${isCancer ? 'text-danger' : 'text-success'}`}>
          {isCancer ? '▲ Above threshold' : '▼ Below threshold'}
        </span>
      </div>
    </div>
  )
}

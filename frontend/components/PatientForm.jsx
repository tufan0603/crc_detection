'use client'

const inputCls = "w-full bg-surface border border-border rounded-md px-3 py-2 text-sm text-textprimary placeholder-muted focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all"
const labelCls = "block text-[11px] font-semibold text-textsub mb-1 uppercase tracking-wider"

export default function PatientForm({ data, onChange }) {
  const field = (label, key, type = 'text', opts = {}) => (
    <div>
      <label className={labelCls}>{label}</label>
      {opts.select ? (
        <select
          value={data[key] || ''}
          onChange={e => onChange(key, e.target.value)}
          className={inputCls}
        >
          <option value="">Select</option>
          {opts.options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type={type}
          value={data[key] || ''}
          onChange={e => onChange(key, e.target.value)}
          placeholder={opts.placeholder || ''}
          className={inputCls}
        />
      )}
    </div>
  )

  return (
    <div className="bg-surface border border-border rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-0.5 h-4 rounded-full bg-primary flex-shrink-0" />
        <h3 className="text-textprimary font-semibold text-sm">Patient Information</h3>
      </div>

      {/* Patient ID — read only */}
      <div>
        <label className={labelCls}>Patient ID</label>
        <input
          type="text"
          value={data.patient_id || ''}
          readOnly
          className="w-full bg-bg border border-border rounded-md px-3 py-2 text-sm text-muted cursor-not-allowed font-mono focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {field('Full Name',  'patient_name', 'text',   { placeholder: 'Patient full name' })}
        {field('Age',        'age',          'number', { placeholder: 'Years' })}
        {field('Gender',     'gender',       'text',   { select: true, options: ['Male', 'Female', 'Other'] })}
        {field('Scan Date',  'scan_date',    'date')}
      </div>
    </div>
  )
}

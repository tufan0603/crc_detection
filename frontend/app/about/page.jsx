'use client'
import TopBar from '@/components/TopBar'
import {
  Brain, Layers, Zap, BookOpen, AlertTriangle,
  CheckCircle, Database, Cpu, GitMerge, FileText, Activity, Shield
} from 'lucide-react'

const MODEL_ARCH = [
  {
    name: 'DenseNet121', icon: Layers, color: '#2563eb', bg: '#eff6ff',
    desc: 'Each layer connects to every other in a feed-forward fashion, enabling strong feature reuse and gradient flow.',
    params: '7M', depth: '121 layers', strength: 'Feature reuse, gradient flow',
    steps: ['Input (1, 64, 128, 128)', 'Dense Block × 4', 'Transition Layers', 'Global Avg Pool', 'FC → 2 classes'],
  },
  {
    name: 'ResNet3D', icon: Brain, color: '#7c3aed', bg: '#f5f3ff',
    desc: 'Skip connections allow gradients to flow directly, solving the vanishing gradient problem in deep networks.',
    params: '3M', depth: '4 residual blocks', strength: 'Skip connections, fast training',
    steps: ['Input (1, 64, 128, 128)', 'Stem Conv + MaxPool', 'ResBlock × 3 (64→256)', 'Adaptive Avg Pool', 'Dropout → FC → 2'],
  },
  {
    name: 'EfficientNet3D', icon: Zap, color: '#ea580c', bg: '#fff7ed',
    desc: 'MBConv blocks with Squeeze-and-Excitation attention. Scales depth, width, and resolution efficiently.',
    params: '8M', depth: '11 MBConv blocks', strength: 'SE attention, efficiency',
    steps: ['Input (1, 64, 128, 128)', 'Stem Conv', 'MBConv × 11 (SE)', 'Head Conv + Pool', 'Dropout → FC → 2'],
  },
]

const PIPELINE_STEPS = [
  { icon: FileText,    color: '#2563eb', title: 'DICOM Loading',        desc: 'All .dcm files loaded, sorted by Z-axis or InstanceNumber' },
  { icon: Activity,    color: '#7c3aed', title: 'HU Conversion',        desc: 'Pixel values converted to Hounsfield Units via RescaleSlope & Intercept' },
  { icon: Cpu,         color: '#ea580c', title: 'Volume Clipping',      desc: 'HU values clipped to [−1000, 1000] and normalized to [0, 1]' },
  { icon: Layers,      color: '#16a34a', title: 'Center Crop',          desc: 'Center 32 slices extracted to remove depth bias between datasets' },
  { icon: Zap,         color: '#ec4899', title: 'Depth Normalization',  desc: 'Volume resampled to exactly 64 slices via scipy.ndimage.zoom' },
  { icon: Brain,       color: '#0d9488', title: 'Spatial Resize',       desc: 'Each slice resized to 128×128 px using bilinear interpolation' },
  { icon: GitMerge,    color: '#d97706', title: 'Z-score Normalization', desc: 'Volume normalized: (x − mean) / (std + 1e-6) for stable training' },
  { icon: CheckCircle, color: '#2563eb', title: 'Model Inference',      desc: 'Full 3D volume (1×64×128×128) passed through selected model(s) once' },
]

const TECH_STACK = [
  { label: 'Frontend',   value: 'Next.js 14 + Tailwind CSS' },
  { label: 'Backend',    value: 'Flask (Python) + MONAI' },
  { label: 'Models',     value: 'DenseNet121 / ResNet3D / EfficientNet3D' },
  { label: 'Framework',  value: 'PyTorch + MONAI' },
  { label: 'Database',   value: 'PostgreSQL (Neon Serverless)' },
  { label: 'Input',      value: 'DICOM (.dcm) CT scans' },
  { label: 'Training',   value: '519 patients (230 cancer + 289 normal)' },
  { label: 'Deployment', value: 'Local — Flask :5000 + Next.js :3000' },
]

const HOW_TO = [
  { step: '01', title: 'Select AI Model',    desc: 'Choose DenseNet121, ResNet3D, EfficientNet3D, or Ensemble mode to use all 3 simultaneously.' },
  { step: '02', title: 'Fill Patient Info',  desc: 'Enter patient name, age, gender, and scan date. Patient ID is auto-generated and saved with the result.' },
  { step: '03', title: 'Upload DICOM Files', desc: 'Drag & drop the CT scan folder or browse to select .dcm files. All DICOM files are found recursively.' },
  { step: '04', title: 'Run Detection',      desc: 'Click Run Cancer Detection. AI preprocesses the 3D volume and runs inference — takes 30–120 seconds.' },
  { step: '05', title: 'View Results',       desc: 'See prediction, confidence %, per-model breakdown, and a comparison chart across models.' },
  { step: '06', title: 'Check History',      desc: 'All results auto-saved to the database. View, filter, search, download PDFs, or delete from the History page.' },
]

export default function AboutPage() {
  return (
    <div className="flex flex-col h-full overflow-auto bg-bg">
      <TopBar title="About" subtitle="How to use this tool, model architecture, and technical details" />

      <div className="flex-1 p-5 max-w-5xl mx-auto w-full animate-fade-in space-y-0">

        {/* ── Intro ── */}
        <div className="bg-surface border border-border rounded-xl p-5 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg gradient-blue flex items-center justify-center flex-shrink-0">
              <Activity size={17} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-textprimary">CancerDetect AI</h1>
              <p className="text-xs text-muted">AI-powered colorectal cancer detection from CT scan volumes</p>
            </div>
          </div>
          <p className="text-sm text-textsub leading-relaxed mb-3">
            Supports three 3D deep learning model architectures with ensemble prediction for higher accuracy.
            Processes raw DICOM CT scans through a standardized preprocessing pipeline before inference.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: 'DenseNet121', color: '#2563eb', bg: '#eff6ff' },
              { label: 'ResNet3D',    color: '#7c3aed', bg: '#f5f3ff' },
              { label: 'EfficientNet3D', color: '#ea580c', bg: '#fff7ed' },
              { label: 'Ensemble',    color: '#16a34a', bg: '#f0fdf4' },
            ].map(({ label, color, bg }) => (
              <span key={label} className="px-2.5 py-1 rounded-full text-[11px] font-semibold border"
                style={{ color, background: bg, borderColor: `${color}30` }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* ── How to use ── */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-4">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border" style={{ background: '#dce7f5' }}>
            <BookOpen size={14} className="text-primary" />
            <h2 className="text-sm font-semibold text-textprimary">How to Use</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-3">
            {HOW_TO.map(({ step, title, desc }) => (
              <div key={step} className="flex gap-3">
                <div className="w-7 h-7 rounded-md gradient-blue flex items-center justify-center flex-shrink-0 text-white text-[10px] font-bold">
                  {step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-textprimary">{title}</p>
                  <p className="text-xs text-textsub mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── AI Model Architectures ── */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-4">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border" style={{ background: '#dce7f5' }}>
            <Brain size={14} className="text-purple" />
            <h2 className="text-sm font-semibold text-textprimary">AI Model Architectures</h2>
          </div>
          <div className="divide-y divide-border">
            {MODEL_ARCH.map(({ name, icon: Icon, color, bg, desc, params, depth, strength, steps }) => (
              <div key={name} className="p-5 grid grid-cols-3 gap-5">
                {/* Left: name + desc */}
                <div className="col-span-2">
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                      <Icon size={16} style={{ color }} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-textprimary">{name}</p>
                      <p className="text-[10px] text-muted">{params} params · {depth}</p>
                    </div>
                  </div>
                  <p className="text-xs text-textsub leading-relaxed">{desc}</p>
                  <p className="text-[11px] font-medium mt-2" style={{ color }}>✦ {strength}</p>
                </div>
                {/* Right: architecture steps */}
                <div>
                  <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Architecture</p>
                  <div className="space-y-1">
                    {steps.map((s, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: color }} />
                        <span className="text-[10px] text-textsub font-mono leading-relaxed">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Preprocessing Pipeline ── */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-4">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border" style={{ background: '#dce7f5' }}>
            <Cpu size={14} className="text-teal" />
            <h2 className="text-sm font-semibold text-textprimary">Preprocessing Pipeline</h2>
          </div>
          <div className="p-5 grid grid-cols-4 gap-3">
            {PIPELINE_STEPS.map(({ icon: Icon, color, title, desc }, i) => (
              <div key={i} className="relative border border-border rounded-lg p-3" style={{ background: '#e8eff8' }}>
                <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ background: color }}>{i + 1}</div>
                <div className="w-7 h-7 rounded-md flex items-center justify-center mb-2"
                  style={{ background: `${color}15` }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <p className="text-[11px] font-semibold text-textprimary mb-1">{title}</p>
                <p className="text-[10px] text-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Ensemble Prediction ── */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-4">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border" style={{ background: '#dce7f5' }}>
            <GitMerge size={14} className="text-success" />
            <h2 className="text-sm font-semibold text-textprimary">Ensemble Prediction</h2>
          </div>
          <div className="p-5 grid grid-cols-2 gap-5">
            <div>
              <p className="text-xs text-textsub leading-relaxed mb-2">
                In Ensemble mode, all selected models run independently on the same preprocessed volume.
                Their cancer probabilities are averaged to produce a final prediction.
              </p>
              <p className="text-xs text-textsub leading-relaxed">
                This reduces individual model bias and generally produces more reliable results than any single model alone.
              </p>
            </div>
            <div className="space-y-1.5">
              {[
                { label: 'DenseNet121 cancer_prob',    value: '0.72',             color: '#2563eb' },
                { label: 'ResNet3D cancer_prob',        value: '0.68',             color: '#7c3aed' },
                { label: 'EfficientNet3D cancer_prob',  value: '0.75',             color: '#ea580c' },
                { label: 'Ensemble average',            value: '0.717 → Cancerous', color: '#16a34a', bold: true },
              ].map(({ label, value, color, bold }) => (
                <div key={label} className="flex items-center justify-between px-3 py-2 rounded-md border border-border">
                  <span className="text-xs text-textsub">{label}</span>
                  <span className="text-xs font-semibold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tech Stack ── */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden mb-4">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-border" style={{ background: '#dce7f5' }}>
            <Database size={14} className="text-primary" />
            <h2 className="text-sm font-semibold text-textprimary">Technical Stack</h2>
          </div>
          <table className="w-full text-xs">
            <tbody>
              {TECH_STACK.map(({ label, value }, i) => (
                <tr key={label}
                  className={i < TECH_STACK.length - 1 ? 'border-b border-border' : ''}
                  style={{ background: i % 2 === 0 ? '#eef3fb' : '#e8eff8' }}>
                  <td className="px-5 py-2.5 text-muted font-semibold w-32">{label}</td>
                  <td className="px-5 py-2.5 text-textprimary font-medium">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Disclaimer ── */}
        <div className="flex items-start gap-3 px-5 py-4 rounded-xl border-2 border-yellow-200 bg-yellow-50">
          <div className="w-8 h-8 rounded-lg bg-warning flex items-center justify-center flex-shrink-0">
            <Shield size={15} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-xs text-yellow-800 mb-1">Medical Disclaimer</p>
            <p className="text-yellow-700 text-xs leading-relaxed">
              This tool is for <strong>research and educational purposes only</strong>. It is not a certified medical device
              and must not be used as a substitute for professional clinical diagnosis. All predictions must be reviewed
              by a qualified radiologist or oncologist before any clinical decision is made.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}

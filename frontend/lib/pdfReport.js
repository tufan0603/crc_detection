export async function downloadScanReport(scan) {
  const { jsPDF } = await import('jspdf')

  const pdf = new jsPDF('p', 'mm', 'a4')
  const W      = 210
  const margin = 15
  let y        = 20

  const isCancer  = scan.prediction === 'Cancerous'
  const conf      = scan.confidence ? (scan.confidence * 100).toFixed(1) : '—'
  const models    = scan.models_used ? scan.models_used.split(',') : []
  const isEnsemble = models.length > 1

  const MODEL_META = {
    densenet:     { label: 'DenseNet121',    color: [59, 110, 248] },
    resnet:       { label: 'ResNet3D',       color: [139, 92, 246] },
    efficientnet: { label: 'EfficientNet3D', color: [249, 115, 22] },
  }

  // ── Header ──
  pdf.setFillColor(59, 110, 248)
  pdf.rect(0, 0, W, 18, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(13)
  pdf.setFont('helvetica', 'bold')
  pdf.text('CancerDetect AI — Diagnostic Report', margin, 12)
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Generated: ${new Date().toLocaleString()}`, W - margin, 12, { align: 'right' })

  y = 28

  // ── Patient Info ──
  pdf.setTextColor(30, 41, 59)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  pdf.text('PATIENT INFORMATION', margin, y)
  y += 2
  pdf.setDrawColor(59, 110, 248)
  pdf.setLineWidth(0.4)
  pdf.line(margin, y, W - margin, y)
  y += 5

  const patientFields = [
    ['Patient ID',   scan.patient_id   || '—'],
    ['Patient Name', scan.patient_name || '—'],
    ['Age',          String(scan.age   || '—')],
    ['Gender',       scan.gender       || '—'],
    ['Scan Date',    scan.scan_date ? new Date(scan.scan_date).toLocaleDateString() : '—'],
  ]

  // Two columns
  patientFields.forEach(([label, value], i) => {
    const col = i % 2 === 0 ? margin : W / 2 + 5
    if (i % 2 === 0 && i > 0) y += 6
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(8)
    pdf.text(label, col, y)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(30, 41, 59)
    pdf.setFontSize(9)
    pdf.text(value, col + 28, y)
  })
  y += 10

  // ── Main Prediction Result ──
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.setTextColor(30, 41, 59)
  pdf.text('AI PREDICTION RESULT', margin, y)
  y += 2
  pdf.setDrawColor(isCancer ? 239 : 34, isCancer ? 68 : 197, isCancer ? 68 : 94)
  pdf.line(margin, y, W - margin, y)
  y += 5

  // Prediction box
  const boxBg     = isCancer ? [254, 242, 242] : [240, 253, 244]
  const boxBorder = isCancer ? [254, 202, 202] : [187, 247, 208]
  const textClr   = isCancer ? [220, 38, 38]   : [22, 163, 74]

  pdf.setFillColor(...boxBg)
  pdf.setDrawColor(...boxBorder)
  pdf.setLineWidth(0.8)
  pdf.roundedRect(margin, y, W - margin * 2, 24, 3, 3, 'FD')

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(20)
  pdf.setTextColor(...textClr)
  pdf.text(scan.prediction || '—', margin + 6, y + 10)

  const risk = isCancer
    ? (scan.confidence >= 0.80 ? 'High Risk' : 'Moderate Risk')
    : 'Low Risk'

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  pdf.text(risk, W - margin - 6, y + 8, { align: 'right' })

  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(8)
  pdf.setTextColor(71, 85, 105)
  pdf.text(`Ensemble Confidence: ${conf}%`, margin + 6, y + 17)
  pdf.text(`Threshold: ${scan.threshold ? (scan.threshold * 100).toFixed(0) : 50}%  |  Total Slices: ${scan.total_slices || '—'}  |  Mode: ${isEnsemble ? 'Ensemble' : 'Single Model'}`, margin + 6, y + 22)

  y += 30

  // Confidence bar
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.setTextColor(71, 85, 105)
  pdf.text(`Overall Confidence: ${conf}%`, margin, y)
  y += 3
  pdf.setFillColor(226, 232, 240)
  pdf.roundedRect(margin, y, W - margin * 2, 4, 2, 2, 'F')
  const barW = ((W - margin * 2) * parseFloat(conf)) / 100
  pdf.setFillColor(...textClr)
  pdf.roundedRect(margin, y, barW, 4, 2, 2, 'F')
  y += 10

  // ── Per-Model Breakdown ──
  if (scan.model_results && Object.keys(scan.model_results).length > 0) {
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(30, 41, 59)
    pdf.text('PER-MODEL CONFIDENCE BREAKDOWN', margin, y)
    y += 2
    pdf.setDrawColor(139, 92, 246)
    pdf.line(margin, y, W - margin, y)
    y += 5

    const modelEntries = Object.entries(scan.model_results)
    const colW = (W - margin * 2) / modelEntries.length

    modelEntries.forEach(([name, m], idx) => {
      const meta      = MODEL_META[name] || { label: name, color: [59, 110, 248] }
      const mc        = m.prediction === 'Cancerous'
      const mConf     = (m.confidence * 100).toFixed(1)
      const mProb     = (m.cancer_prob * 100).toFixed(1)
      const diff      = (m.cancer_prob - (scan.threshold || 0.5))
      const x         = margin + idx * colW
      const cardColor = mc ? [254, 242, 242] : [240, 253, 244]
      const cardBorder = mc ? [254, 202, 202] : [187, 247, 208]
      const predClr   = mc ? [220, 38, 38] : [22, 163, 74]

      // Card background
      pdf.setFillColor(...cardColor)
      pdf.setDrawColor(...cardBorder)
      pdf.setLineWidth(0.6)
      pdf.roundedRect(x, y, colW - 3, 52, 3, 3, 'FD')

      // Model color bar on top
      pdf.setFillColor(...meta.color)
      pdf.roundedRect(x, y, colW - 3, 4, 3, 3, 'F')
      pdf.rect(x, y + 2, colW - 3, 2, 'F')

      let cy = y + 9

      // Model name
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(8)
      pdf.setTextColor(...meta.color)
      pdf.text(meta.label, x + 3, cy)
      cy += 5

      // Prediction
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(...predClr)
      pdf.text(m.prediction, x + 3, cy)
      cy += 5

      // Confidence label + value
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(7)
      pdf.setTextColor(71, 85, 105)
      pdf.text('Confidence:', x + 3, cy)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(10)
      pdf.setTextColor(...predClr)
      pdf.text(`${mConf}%`, x + colW - 6, cy + 1, { align: 'right' })
      cy += 3

      // Confidence bar
      pdf.setFillColor(226, 232, 240)
      pdf.roundedRect(x + 3, cy, colW - 9, 3, 1, 1, 'F')
      pdf.setFillColor(...predClr)
      pdf.roundedRect(x + 3, cy, (colW - 9) * parseFloat(mConf) / 100, 3, 1, 1, 'F')
      cy += 6

      // Cancer prob label + value
      pdf.setFont('helvetica', 'normal')
      pdf.setFontSize(7)
      pdf.setTextColor(71, 85, 105)
      pdf.text('Cancer Prob:', x + 3, cy)
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(9)
      pdf.setTextColor(...meta.color)
      pdf.text(`${mProb}%`, x + colW - 6, cy, { align: 'right' })
      cy += 3

      // Cancer prob bar
      pdf.setFillColor(226, 232, 240)
      pdf.roundedRect(x + 3, cy, colW - 9, 3, 1, 1, 'F')
      pdf.setFillColor(...meta.color)
      pdf.roundedRect(x + 3, cy, (colW - 9) * parseFloat(mProb) / 100, 3, 1, 1, 'F')
      cy += 6

      // vs threshold
      pdf.setFont('helvetica', 'bold')
      pdf.setFontSize(7)
      pdf.setTextColor(diff >= 0 ? 220 : 22, diff >= 0 ? 38 : 163, diff >= 0 ? 38 : 74)
      pdf.text(
        `${diff >= 0 ? '▲' : '▼'} ${Math.abs(diff * 100).toFixed(1)}% ${diff >= 0 ? 'above' : 'below'} threshold`,
        x + 3, cy
      )
    })

    y += 58
  } else if (models.length > 0) {
    // Fallback: just show model names used
    pdf.setFont('helvetica', 'bold')
    pdf.setFontSize(9)
    pdf.setTextColor(30, 41, 59)
    pdf.text('MODELS USED', margin, y)
    y += 2
    pdf.setDrawColor(139, 92, 246)
    pdf.line(margin, y, W - margin, y)
    y += 5
    pdf.setFont('helvetica', 'normal')
    pdf.setFontSize(9)
    pdf.setTextColor(71, 85, 105)
    pdf.text(models.map(m => MODEL_META[m]?.label || m).join('  +  '), margin, y)
    y += 10
  }

  // ── Scan Details ──
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(9)
  pdf.setTextColor(30, 41, 59)
  pdf.text('SCAN DETAILS', margin, y)
  y += 2
  pdf.setDrawColor(20, 184, 166)
  pdf.line(margin, y, W - margin, y)
  y += 5

  const details = [
    ['Recorded At',       new Date(scan.created_at).toLocaleString()],
    ['Cancer Slices',     String(scan.cancer_slices ?? '—')],
    ['Decision Threshold', `${scan.threshold ? (scan.threshold * 100).toFixed(0) : 50}%`],
    ['Ensemble Mode',     isEnsemble ? `Yes (${models.length} models)` : 'No'],
  ]

  details.forEach(([label, value], i) => {
    const col = i % 2 === 0 ? margin : W / 2 + 5
    if (i % 2 === 0 && i > 0) y += 6
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(8)
    pdf.text(label, col, y)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(30, 41, 59)
    pdf.setFontSize(9)
    pdf.text(value, col + 38, y)
  })
  y += 12

  // ── Disclaimer ──
  pdf.setFillColor(255, 251, 235)
  pdf.setDrawColor(253, 230, 138)
  pdf.setLineWidth(0.6)
  pdf.roundedRect(margin, y, W - margin * 2, 16, 3, 3, 'FD')
  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(8)
  pdf.setTextColor(180, 83, 9)
  pdf.text('Medical Disclaimer:', margin + 4, y + 5)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(120, 53, 15)
  pdf.text('This report is AI-assisted and for research/educational purposes only.', margin + 4, y + 10)
  pdf.text('Always consult a qualified medical professional for clinical diagnosis.', margin + 4, y + 14)

  // ── Footer ──
  pdf.setFillColor(59, 110, 248)
  pdf.rect(0, 282, W, 15, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(7)
  pdf.setFont('helvetica', 'normal')
  pdf.text('CancerDetect AI — DenseNet121 · ResNet3D · EfficientNet3D | PyTorch + MONAI', margin, 291)
  pdf.text('Page 1 of 1', W - margin, 291, { align: 'right' })

  pdf.save(`CancerDetect_${scan.patient_id || 'report'}_${new Date().toISOString().slice(0, 10)}.pdf`)
}

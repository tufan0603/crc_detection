'use client'
import { useState } from 'react'
import TopBar from '@/components/TopBar'
import PatientForm from '@/components/PatientForm'
import UploadZone from '@/components/UploadZone'
import ResultPanel from '@/components/ResultPanel'
import AnalysisLoader from '@/components/AnalysisLoader'
import ModelSelector from '@/components/ModelSelector'
import { ScanLine, RotateCcw } from 'lucide-react'
import axios from 'axios'

export default function ScanPage() {
  const [patient, setPatient] = useState({
    patient_id: `PT-${Date.now().toString().slice(-6)}`
  })
  const [files, setFiles]           = useState([])
  const [selectedModels, setModels] = useState(['densenet'])
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState(null)
  const [error, setError]           = useState(null)

  const updatePatient = (key, val) => setPatient(p => ({ ...p, [key]: val }))

  const handleRun = async () => {
    if (files.length === 0)            { setError('Please select DICOM files first.'); return }
    if (!patient.patient_name?.trim()) { setError('Please enter patient name.'); return }
    if (!patient.age)                  { setError('Please enter patient age.'); return }
    if (!patient.gender)               { setError('Please select patient gender.'); return }
    if (!patient.scan_date)            { setError('Please select scan date.'); return }
    setLoading(true); setError(null); setResult(null)

    const formData = new FormData()
    files.forEach(f => formData.append('files', f))
    formData.append('models', selectedModels.join(','))

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'
      const res  = await axios.post(`${backendUrl}/predict`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      const data = res.data
      setResult(data)

      await fetch('/api/scans/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...patient,
          age:           patient.age ? parseInt(patient.age) : null,
          prediction:    data.prediction,
          confidence:    data.confidence ?? 0,
          total_slices:  data.total_slices,
          cancer_slices: data.cancer_slices,
          threshold:     data.threshold,
          models_used:   (data.models_used || selectedModels).join(','),
          model_results: data.models ?? null,
        }),
      })
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResult(null); setError(null); setFiles([])
    setPatient({ patient_id: `PT-${Date.now().toString().slice(-6)}` })
    setModels(['densenet'])
  }

  return (
    <div className="flex flex-col h-full overflow-auto bg-bg">
      {loading && <AnalysisLoader />}

      <TopBar title="New Scan" subtitle="Upload a patient CT scan for AI-powered cancer detection">
        {result && (
          <button onClick={reset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-border text-textsub hover:text-textprimary text-xs font-semibold transition-colors">
            <RotateCcw size={12} /> New Scan
          </button>
        )}
      </TopBar>

      <div className="flex-1 p-5 animate-fade-in">
        {!result ? (
          <div className="max-w-5xl mx-auto space-y-4">
            <ModelSelector selected={selectedModels} onChange={setModels} />

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-4">
                <PatientForm data={patient} onChange={updatePatient} />

                {error && (
                  <div className="px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-danger text-xs font-medium">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleRun}
                  disabled={loading || files.length === 0}
                  className="w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed gradient-blue text-white hover:opacity-95"
                >
                  <ScanLine size={16} />
                  {selectedModels.length > 1
                    ? `Run Ensemble Detection (${selectedModels.length} models)`
                    : 'Run Cancer Detection'
                  }
                </button>
              </div>

              <UploadZone onFilesSelected={setFiles} loading={loading} />
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <ResultPanel result={result} patient={patient} />
          </div>
        )}
      </div>
    </div>
  )
}

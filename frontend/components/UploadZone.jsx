'use client'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { FolderOpen, X, FileText } from 'lucide-react'

export default function UploadZone({ onFilesSelected, loading }) {
  const [files, setFiles] = useState([])

  const onDrop = useCallback((accepted) => {
    const dcm = accepted.filter(f => f.name.toLowerCase().endsWith('.dcm'))
    setFiles(dcm)
    onFilesSelected(dcm)
  }, [onFilesSelected])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/octet-stream': ['.dcm'] },
    multiple: true,
  })

  const clear = () => { setFiles([]); onFilesSelected([]) }

  return (
    <div className="bg-surface border border-border rounded-xl p-4 flex flex-col h-full space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-0.5 h-4 rounded-full bg-primary flex-shrink-0" />
        <h3 className="text-textprimary font-semibold text-sm">DICOM Files</h3>
      </div>

      <div
        {...getRootProps()}
        className={`rounded-lg border-2 border-dashed flex flex-col items-center justify-center py-8 px-5 cursor-pointer transition-all duration-200 flex-1 ${
          isDragActive
            ? 'border-primary bg-primary/8'
            : 'border-border hover:border-primary/40'
        }`}
      >
        <input {...getInputProps()} webkitdirectory="" directory="" multiple />
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 ${isDragActive ? 'gradient-blue' : 'bg-gray-100 border border-border'}`}>
          <FolderOpen size={22} className={isDragActive ? 'text-white' : 'text-primary'} />
        </div>
        <p className="text-textprimary font-semibold text-sm mb-1">
          {isDragActive ? 'Drop files here' : 'Drag & drop DICOM files or folder'}
        </p>
        <p className="text-muted text-xs mb-4 text-center">Supports .dcm files — select a full patient scan folder</p>
        <button
          type="button"
          className="px-4 py-1.5 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          Browse Files
        </button>
      </div>

      {files.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-2">
            <FileText size={13} className="text-primary" />
            <span className="text-primary text-xs font-semibold">
              {files.length} DICOM file{files.length > 1 ? 's' : ''} selected
            </span>
          </div>
          <button onClick={clear} className="text-muted hover:text-danger transition-colors ml-2">
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  )
}

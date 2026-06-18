'use client'
import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ open, onClose, title, children, maxWidth = 'max-w-lg' }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative rounded-xl border border-border shadow-xl w-full ${maxWidth} animate-slide-up`} style={{ background: '#eef3fb' }}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border" style={{ background: '#dce7f5' }}>
          <h2 className="text-textprimary font-semibold text-sm">{title}</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-md bg-gray-50 hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-muted" />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  )
}

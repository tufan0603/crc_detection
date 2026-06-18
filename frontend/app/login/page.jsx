'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Activity, Lock, User, Eye, EyeOff, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm]       = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login failed'); return }
      router.push('/')
      router.refresh()
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="w-full max-w-sm px-4">

        {/* Logo */}
        <div className="flex flex-col items-center mb-7">
          <div className="w-14 h-14 rounded-2xl gradient-blue flex items-center justify-center shadow-lg mb-3">
            <Activity size={24} className="text-white" />
          </div>
          <h1 className="text-textprimary font-bold text-xl tracking-tight">CancerDetect AI</h1>
          <p className="text-muted text-sm mt-1">Colorectal Cancer Detection System</p>
        </div>

        {/* Card */}
        <div className="border border-border rounded-2xl p-6 shadow-sm" style={{ background: '#eef3fb' }}>
          <h2 className="text-textprimary font-semibold text-base mb-5">Sign in to continue</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-red-50 border border-red-200">
                <AlertCircle size={14} className="text-danger flex-shrink-0" />
                <p className="text-danger text-xs font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-textsub mb-1.5">Username</label>
              <div className="relative">
                <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="Enter username"
                  required
                  autoComplete="username"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-border text-sm text-textprimary placeholder-muted focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-colors bg-bg"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textsub mb-1.5">Password</label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                  className="w-full pl-9 pr-9 py-2.5 rounded-lg border border-border text-sm text-textprimary placeholder-muted focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-colors bg-bg"
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-textsub transition-colors">
                  {showPass ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !form.username || !form.password}
              className="w-full py-2.5 rounded-lg gradient-blue text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 mt-1">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-muted text-xs mt-4">
          Authorised personnel only · AI-assisted diagnostic tool
        </p>
      </div>
    </div>
  )
}

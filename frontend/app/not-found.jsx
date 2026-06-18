import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-bg p-8 text-center">
      <div className="w-20 h-20 rounded-2xl gradient-red flex items-center justify-center mb-6 shadow-lg">
        <AlertTriangle size={36} className="text-white" />
      </div>
      <h1 className="text-6xl font-extrabold text-textprimary mb-2">404</h1>
      <p className="text-xl font-bold text-textsub mb-2">Page Not Found</p>
      <p className="text-muted text-sm mb-8 max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-blue text-white font-bold text-sm shadow-md hover:opacity-90 transition-opacity">
        Go to Dashboard <ArrowRight size={16} />
      </Link>
    </div>
  )
}

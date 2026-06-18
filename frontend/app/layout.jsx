import './globals.css'
import Sidebar from '@/components/Sidebar'

export const metadata = {
  title: {
    template: '%s | CancerDetect AI',
    default: 'CancerDetect AI',
  },
  description: 'AI-powered colorectal cancer detection from CT scans',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden bg-bg">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          {children}
        </div>
      </body>
    </html>
  )
}

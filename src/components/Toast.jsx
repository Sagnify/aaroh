import { useEffect } from 'react'
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react'

export default function Toast({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <AlertCircle className="w-5 h-5 text-red-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />
  }

  const colors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  }

  return (
    <div className={`fixed top-20 right-4 z-50 ${colors[type]} border rounded-lg shadow-lg p-4 flex items-center gap-3 animate-in slide-in-from-right`}>
      {icons[type]}
      <p className="text-sm font-medium text-gray-900">{message}</p>
      <button onClick={onClose} className="ml-2">
        <X className="w-4 h-4 text-gray-500 hover:text-gray-700" />
      </button>
    </div>
  )
}

import { useState, useCallback } from 'react'

export interface Toast {
  title: string
  description?: string
  variant?: 'default' | 'destructive'
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((toast: Toast) => {
    // For now, we'll use simple alert for notifications
    // In a real implementation, this would show a proper toast component
    if (toast.variant === 'destructive') {
      alert(`Error: ${toast.description || toast.title}`)
    } else {
      alert(`${toast.title}${toast.description ? ': ' + toast.description : ''}`)
    }
    console.log('Toast:', toast)
  }, [])

  return { toast, toasts }
}
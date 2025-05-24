"use client"

import { Toaster } from "react-hot-toast"

const ToasterContext = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 3000,
        style: {
          background: '#fff',
          color: '#333',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          fontSize: '14px',
          maxWidth: '350px',
        },
        success: {
          style: {
            background: '#EBF7EE',
            border: '1px solid #4CAF50',
            color: '#1E4620',
          },
          icon: '✓',
        },
        error: {
          style: {
            background: '#FEECEB',
            border: '1px solid #F44336',
            color: '#5F2120',
          },
          icon: '✕',
        },
        loading: {
          style: {
            background: '#E3F2FD',
            border: '1px solid #2196F3',
            color: '#0D3C61',
          },
        },
      }}
    />
  )
}

export default ToasterContext
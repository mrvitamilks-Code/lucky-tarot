import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export default function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0A0612',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#C9A84C',
      fontFamily: 'sans-serif',
      fontSize: '24px'
    }}>
      ✦ ลัคนาไพ่ — กำลังโหลด...
    </div>
  )
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Verify root element exists
const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('❌ Root element not found!')
  throw new Error('Failed to find root element')
}

console.log('🚀 App starting...')
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

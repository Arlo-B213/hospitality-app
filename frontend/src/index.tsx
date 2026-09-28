import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerServiceWorker } from './service-worker-register'

const root = document.getElementById('root')

if (!root) {
  throw new Error('Root element not found')
}

// Register service worker for PWA support
registerServiceWorker().catch((error) => {
  console.warn('Failed to register service worker:', error)
})

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

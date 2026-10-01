import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('[SyncLife] main.tsx starting...')

const rootEl = document.getElementById('root')
console.log('[SyncLife] root element:', rootEl)

if (rootEl) {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    console.log('[SyncLife] React finished rendering App component')
  } catch (e) {
    console.error('[SyncLife] React error with rendering:', e)
    rootEl.innerHTML = '<div style="padding:20px;color:red;">error with rendering: ' + String(e) + '</div>'
  }
} else {
  console.error('[SyncLife] cannot find root element to render React app. Please check your index.html file.')
}

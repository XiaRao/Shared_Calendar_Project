import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

console.log('[SyncLife] main.tsx 开始执行')

const rootEl = document.getElementById('root')
console.log('[SyncLife] root 元素:', rootEl)

if (rootEl) {
  try {
    createRoot(rootEl).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    console.log('[SyncLife] React 渲染完成')
  } catch (e) {
    console.error('[SyncLife] React 渲染错误:', e)
    rootEl.innerHTML = '<div style="padding:20px;color:red;">渲染错误: ' + String(e) + '</div>'
  }
} else {
  console.error('[SyncLife] 找不到 #root 元素')
}

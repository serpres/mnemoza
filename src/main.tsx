import { createRoot } from 'react-dom/client'
import { Workbox } from 'workbox-window'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById('root')!
rootElement.innerHTML = ''

createRoot(rootElement).render(<App />)

if ('serviceWorker' in navigator) {
  const wb = new Workbox('/sw.js')

  wb.addEventListener('controlling', () => {
    window.location.reload()
  })

  wb.register()
}

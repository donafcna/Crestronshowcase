import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './marketing.css'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext'
import { RouterProvider } from './router'
import { applyDevModeFromUrl } from './hooks/useDevMode'
import { applyGuiFullscreenFromUrl } from './hooks/useGuiFullscreen'

// Mode Dev : /1 active, /0 désactive (mémorisé dans le navigateur), avant le routage
applyDevModeFromUrl()
// Plein écran de la GUI : /3 active, /4 revient au Mode normal (même principe)
applyGuiFullscreenFromUrl()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </RouterProvider>
  </StrictMode>,
)

// PWA : enregistrement du service worker (production uniquement)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('Service worker registration failed', err)
    })
  })
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './marketing.css'
import App from './App.jsx'
import { LanguageProvider } from './context/LanguageContext'
import { RouterProvider } from './router'
import { applyDevModeFromUrl } from './hooks/useDevMode'
import { applyGuiFullscreenFromUrl } from './hooks/useGuiFullscreen'
import { applyGui3dTabFromUrl } from './hooks/useGui3dTab'

// Mode Dev : /1 active, /0 désactive (mémorisé dans le navigateur), avant le routage
applyDevModeFromUrl()
// Plein écran de la GUI : /3 active, /4 revient au Mode normal (même principe)
applyGuiFullscreenFromUrl()
// Onglet Vue 3D des GUI Boutique / Yacht : /5 l'affiche, /6 le masque (même principe)
applyGui3dTabFromUrl()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </RouterProvider>
  </StrictMode>,
)

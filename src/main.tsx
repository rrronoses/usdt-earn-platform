import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppProvider } from './context/AppContext'
import { ThemeLangProvider } from './context/ThemeLangContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeLangProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </ThemeLangProvider>
  </StrictMode>,
)

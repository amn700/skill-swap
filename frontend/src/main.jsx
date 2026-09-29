import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import { ThemeProvider } from './components/theme-provider.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <Landing />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import WidgetApp from './WidgetApp'
import { initTheme } from './hooks/useThemeStore'
import './index.css'

initTheme()

document.body.style.backgroundColor = 'transparent'

createRoot(document.getElementById('widget-root')!).render(
  <StrictMode>
    <WidgetApp />
  </StrictMode>,
)

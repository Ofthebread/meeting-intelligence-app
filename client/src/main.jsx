import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { MeetingProvider } from './context/MeetingContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MeetingProvider>
      <App />
    </MeetingProvider>
  </StrictMode>,
)

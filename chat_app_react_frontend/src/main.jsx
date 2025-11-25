import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

/*
  Δημιουργώ ένα React DOM Instance του <div id="root"></div> από το index.html
  ώστε η React να μπορέσει εκεί μέσα να κάνει rendering το App Component
*/
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

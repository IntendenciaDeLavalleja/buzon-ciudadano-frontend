import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { queryClient } from './lib/query-client'
import './styles/global.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#333',
            color: '#fff',
            fontFamily: 'serif',
          },
          success: {
             style: {
               background: '#dcfce7',
               color: '#166534',
             }
          },
          error: {
            style: {
              background: '#fee2e2',
              color: '#991b1b',
            }
          }
        }} 
      />
    </QueryClientProvider>
  </StrictMode>,
)

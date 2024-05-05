import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import App from './App'
import { BrowserRouter as Router } from 'react-router-dom'
import { UserProvider } from './components/UserContext'

const queryClient = new QueryClient()


ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <Router>
        <App />
      </Router>
    </UserProvider>
  </QueryClientProvider>
)
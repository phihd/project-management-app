import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from 'react-query'
import App from './App'
import { BrowserRouter as Router } from 'react-router-dom'
import { UserProvider } from './components/UserContext'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
NProgress.configure({ easing: 'ease', speed: 500 })
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onQueryStart: () => {
        console.log('Query started')
        NProgress.start()
      },
      onQuerySuccess: () => {
        console.log('Query succeeded')
        NProgress.done()
      },
      onQueryError: () => {
        console.log('Query failed')
        NProgress.done()
      },
    },
  },
})


ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <Router>
        <App />
      </Router>
    </UserProvider>
  </QueryClientProvider>
)
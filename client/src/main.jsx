import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider } from 'react-redux'
import { store } from './redux/store.js'
import ErrorBoundary from './components/common/ErrorBoundary'
import QueryProvider from './hooks/QueryProvider'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <QueryProvider>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </QueryProvider>
    </Provider>
  </React.StrictMode>,
)

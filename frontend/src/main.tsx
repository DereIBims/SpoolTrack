import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './style.css'
import { initI18n } from './i18n-rt'

async function bootstrap() {
    try {
        await initI18n()
    } catch (e) {
        console.error(e)
    }

    ReactDOM.createRoot(document.getElementById('root')!).render(
        <App />
    )
}

bootstrap()

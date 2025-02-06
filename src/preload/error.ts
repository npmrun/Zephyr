import { ipcRenderer } from 'electron'

window.addEventListener('error', (event) => {
    ipcRenderer.send('renderer-error', {
        message: event.error?.message || 'Unknown error',
        stack: event.error?.stack,
        time: new Date().toISOString()
    })
})

window.addEventListener('unhandledrejection', (event) => {
    ipcRenderer.send('renderer-error', {
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        time: new Date().toISOString()
    })
}) 
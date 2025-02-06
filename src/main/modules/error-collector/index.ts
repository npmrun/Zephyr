import { app, BrowserWindow, ipcMain } from 'electron'
import { injectable } from 'inversify'
import BaseClass from 'vc/base/base'
import _debug from 'debug'
import fs from 'fs-extra'
import path from 'path'

const debug = _debug('app:error-collector')

interface ErrorInfo {
    type: 'main' | 'renderer'
    message: string
    stack?: string
    time: string
    processInfo?: {
        platform: string
        version: string
        arch: string
    }
    windowInfo?: {
        id: number
        url: string
    }
    additional?: any
}

@injectable()
export class ErrorCollector extends BaseClass {
    private logPath: string
    private maxLogSize = 10 * 1024 * 1024 // 10MB
    private maxLogFiles = 5

    constructor() {
        super()
        this.logPath = path.join(app.getPath('userData'), 'logs')
        fs.ensureDirSync(this.logPath)
    }

    init() {
        this.setupMainProcessErrorHandling()
        this.setupRendererProcessErrorHandling()
        this.setupProcessErrorHandling()
        this.setupIpcErrorHandling()
        this.cleanOldLogs()
    }

    private setupMainProcessErrorHandling() {
        // 捕获未处理的Promise错误
        process.on('unhandledRejection', (reason, promise) => {
            this.collectError({
                type: 'main',
                message: `Unhandled Rejection: ${reason}`,
                time: new Date().toISOString(),
                processInfo: this.getProcessInfo(),
            })
        })
    }

    private setupRendererProcessErrorHandling() {
        app.on('web-contents-created', (_, contents) => {
            contents.on('render-process-gone', (event, details) => {
                this.collectError({
                    type: 'renderer',
                    message: `Renderer Process Gone: ${details.reason}`,
                    time: new Date().toISOString(),
                    windowInfo: {
                        id: contents.id,
                        url: contents.getURL()
                    },
                    processInfo: this.getProcessInfo(),
                })
            })

            contents.on('crashed', () => {
                this.collectError({
                    type: 'renderer',
                    message: 'Renderer Process Crashed',
                    time: new Date().toISOString(),
                    windowInfo: {
                        id: contents.id,
                        url: contents.getURL()
                    },
                    processInfo: this.getProcessInfo(),
                })
            })
        })
    }

    private setupProcessErrorHandling() {
        process.on('uncaughtException', (error) => {
            this.collectError({
                type: 'main',
                message: error.message,
                stack: error.stack,
                time: new Date().toISOString(),
                processInfo: this.getProcessInfo(),
            })
        })
    }

    private setupIpcErrorHandling() {
        ipcMain.on('renderer-error', (_, errorData) => {
            this.collectError({
                type: 'renderer',
                message: errorData.message,
                stack: errorData.stack,
                time: errorData.time,
                processInfo: this.getProcessInfo(),
            })
        })
    }

    private getProcessInfo() {
        return {
            platform: process.platform,
            version: app.getVersion(),
            arch: process.arch
        }
    }

    async collectError(errorInfo: ErrorInfo) {
        try {
            const logFile = path.join(this.logPath, `error-${new Date().toISOString().split('T')[0]}.log`)
            const logEntry = JSON.stringify(errorInfo) + '\n'
            
            await fs.appendFile(logFile, logEntry)
            debug('Error collected:', errorInfo.message)

            // 如果是渲染进程错误，尝试重载页面
            if (errorInfo.type === 'renderer' && errorInfo.windowInfo) {
                const win = BrowserWindow.fromId(errorInfo.windowInfo.id)
                if (win && !win.isDestroyed()) {
                    win.reload()
                }
            }
        } catch (err) {
            debug('Error while collecting error:', err)
        }
    }

    private async cleanOldLogs() {
        try {
            const files = await fs.readdir(this.logPath)
            const logFiles = files
                .filter(file => file.startsWith('error-') && file.endsWith('.log'))
                .map(file => ({
                    name: file,
                    path: path.join(this.logPath, file),
                    time: fs.statSync(path.join(this.logPath, file)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time)

            // 保留最新的几个日志文件
            for (let i = this.maxLogFiles; i < logFiles.length; i++) {
                await fs.remove(logFiles[i].path)
            }

            // 检查文件大小
            for (const file of logFiles.slice(0, this.maxLogFiles)) {
                const stats = await fs.stat(file.path)
                if (stats.size > this.maxLogSize) {
                    // 如果文件过大，保留后半部分
                    const content = await fs.readFile(file.path, 'utf8')
                    const lines = content.split('\n')
                    const newContent = lines.slice(Math.floor(lines.length / 2)).join('\n')
                    await fs.writeFile(file.path, newContent)
                }
            }
        } catch (err) {
            debug('Error while cleaning logs:', err)
        }
    }

    destroy() {
        // 清理事件监听器
        process.removeAllListeners('unhandledRejection')
        process.removeAllListeners('uncaughtException')
        ipcMain.removeAllListeners('renderer-error')
    }
}

export default ErrorCollector 
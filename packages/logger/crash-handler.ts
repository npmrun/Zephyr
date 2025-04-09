import { app, dialog } from "electron"
import fs from "fs"
import path from "path"
import os from "os"
import logger from "./main"
import errorHandler, { ErrorDetail } from "./main-error"

/**
 * 崩溃报告接口
 */
export interface CrashReport {
  timestamp: string
  error: ErrorDetail
  systemInfo: {
    platform: string
    release: string
    arch: string
    totalMemory: number
    freeMemory: number
    uptime: number
  }
  appInfo: {
    version: string
    name: string
    path: string
    argv: string[]
  }
}

/**
 * 崩溃处理配置
 */
export interface CrashHandlerOptions {
  crashReportDir?: string
  maxReports?: number
  showDialog?: boolean
}

/**
 * 默认崩溃处理配置
 */
const DEFAULT_OPTIONS: CrashHandlerOptions = {
  maxReports: 10,
  showDialog: true,
}

/**
 * 崩溃处理类
 */
export class CrashHandler {
  private static instance: CrashHandler
  private options: CrashHandlerOptions
  private crashReportDir: string
  private initialized: boolean = false
  private startTime: number = Date.now()
  // private normalShutdown: boolean = false

  /**
   * 获取单例实例
   */
  public static getInstance(): CrashHandler {
    if (!CrashHandler.instance) {
      CrashHandler.instance = new CrashHandler()
    }
    return CrashHandler.instance
  }

  /**
   * 构造函数
   */
  private constructor() {
    this.options = { ...DEFAULT_OPTIONS }
    this.crashReportDir = path.join(app.getPath("userData"), "crash-reports")
  }

  /**
   * 初始化崩溃处理器
   */
  public init(options?: CrashHandlerOptions): void {
    if (this.initialized) {
      return
    }

    this.options = { ...this.options, ...options }

    if (options?.crashReportDir) {
      this.crashReportDir = options.crashReportDir
    }

    // 确保崩溃报告目录存在
    if (!fs.existsSync(this.crashReportDir)) {
      fs.mkdirSync(this.crashReportDir, { recursive: true })
    }

    // 检查上次是否崩溃
    this.checkPreviousCrash()

    // 记录应用启动时间
    this.startTime = Date.now()
    this.saveStartupMarker()

    // 设置全局未捕获异常处理器
    this.setupGlobalHandlers()

    // 设置应用退出处理
    app.on("before-quit", () => {
      // this.normalShutdown = true
      this.clearStartupMarker()
    })

    this.initialized = true
    logger.info("crash-handler", "Crash handler initialized")
  }

  /**
   * 设置全局未捕获异常处理器
   */
  private setupGlobalHandlers(): void {
    // 增强现有的错误处理器
    const originalCaptureError = errorHandler.captureError.bind(errorHandler)
    errorHandler.captureError = (error: any, componentInfo?: string, additionalInfo?: Record<string, any>) => {
      // 调用原始方法记录错误
      originalCaptureError(error, componentInfo, additionalInfo)

      // 对于严重错误，生成崩溃报告
      if (error instanceof Error && error.stack) {
        this.generateCrashReport(error, componentInfo, additionalInfo)
      }
    }

    // 捕获未处理的Promise异常
    process.on("unhandledRejection", (reason, promise) => {
      logger.error("crash-handler", `Unhandled Promise Rejection: ${reason}`)
      this.generateCrashReport(reason, "unhandledRejection", { promise: String(promise) })
    })

    // 捕获未捕获的异常
    process.on("uncaughtException", error => {
      logger.error("crash-handler", `Uncaught Exception: ${error.message}`)
      this.generateCrashReport(error, "uncaughtException")

      // 显示错误对话框
      if (this.options.showDialog) {
        this.showCrashDialog(error)
      }
    })
  }

  /**
   * 生成崩溃报告
   */
  private generateCrashReport(error: any, componentInfo?: string, additionalInfo?: Record<string, any>): void {
    try {
      // 格式化错误信息
      const errorDetail = this.formatError(error, componentInfo, additionalInfo)

      // 创建崩溃报告
      const crashReport: CrashReport = {
        timestamp: new Date().toISOString(),
        error: errorDetail,
        systemInfo: {
          platform: os.platform(),
          release: os.release(),
          arch: os.arch(),
          totalMemory: os.totalmem(),
          freeMemory: os.freemem(),
          uptime: os.uptime(),
        },
        appInfo: {
          version: app.getVersion(),
          name: app.getName(),
          path: app.getAppPath(),
          argv: process.argv,
        },
      }

      // 保存崩溃报告
      this.saveCrashReport(crashReport)
    } catch (e) {
      logger.error("crash-handler", `Failed to generate crash report: ${e}`)
    }
  }

  /**
   * 格式化错误信息
   */
  private formatError(error: any, componentInfo?: string, additionalInfo?: Record<string, any>): ErrorDetail {
    // 基本错误信息
    const errorDetail: ErrorDetail = {
      message: "",
      timestamp: new Date().toISOString(),
      type: "Unknown",
    }

    // 处理不同类型的错误
    if (error instanceof Error) {
      errorDetail.message = error.message
      errorDetail.type = error.name || error.constructor.name
      errorDetail.stack = error.stack
    } else if (typeof error === "string") {
      errorDetail.message = error
      errorDetail.type = "String"
    } else if (error === null) {
      errorDetail.message = "Null error received"
      errorDetail.type = "Null"
    } else if (error === undefined) {
      errorDetail.message = "Undefined error received"
      errorDetail.type = "Undefined"
    } else if (typeof error === "object") {
      try {
        errorDetail.message = error.message || JSON.stringify(error)
        errorDetail.type = "Object"
        errorDetail.additionalInfo = { ...error }
      } catch (e) {
        errorDetail.message = "Unserializable error object"
        errorDetail.type = "Unserializable"
      }
    } else {
      try {
        errorDetail.message = String(error)
        errorDetail.type = typeof error
      } catch (e) {
        errorDetail.message = "Error converting to string"
        errorDetail.type = "Unknown"
      }
    }

    // 添加组件信息
    if (componentInfo) {
      errorDetail.componentInfo = componentInfo
    }

    // 添加额外信息
    if (additionalInfo) {
      errorDetail.additionalInfo = {
        ...errorDetail.additionalInfo,
        ...additionalInfo,
      }
    }

    return errorDetail
  }

  /**
   * 保存崩溃报告
   */
  private saveCrashReport(report: CrashReport): void {
    try {
      // 生成唯一的崩溃报告文件名
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
      const filename = `crash-${timestamp}.json`
      const filepath = path.join(this.crashReportDir, filename)

      // 写入崩溃报告
      fs.writeFileSync(filepath, JSON.stringify(report, null, 2))
      logger.info("crash-handler", `Crash report saved: ${filepath}`)

      // 清理旧的崩溃报告
      this.cleanupOldReports()
    } catch (e) {
      logger.error("crash-handler", `Failed to save crash report: ${e}`)
    }
  }

  /**
   * 清理旧的崩溃报告
   */
  private cleanupOldReports(): void {
    try {
      // 获取所有崩溃报告文件
      const files = fs
        .readdirSync(this.crashReportDir)
        .filter(file => file.startsWith("crash-") && file.endsWith(".json"))
        .map(file => ({
          name: file,
          path: path.join(this.crashReportDir, file),
          time: fs.statSync(path.join(this.crashReportDir, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time) // 按时间降序排序

      // 删除超出最大数量的旧报告
      if (files.length > this.options.maxReports!) {
        const filesToDelete = files.slice(this.options.maxReports!)
        filesToDelete.forEach(file => {
          fs.unlinkSync(file.path)
          logger.debug("crash-handler", `Deleted old crash report: ${file.name}`)
        })
      }
    } catch (e) {
      logger.error("crash-handler", `Failed to cleanup old reports: ${e}`)
    }
  }

  /**
   * 保存启动标记
   */
  private saveStartupMarker(): void {
    try {
      const markerPath = path.join(this.crashReportDir, "startup-marker.json")
      const marker = {
        startTime: this.startTime,
        pid: process.pid,
      }
      fs.writeFileSync(markerPath, JSON.stringify(marker))
    } catch (e) {
      logger.error("crash-handler", `Failed to save startup marker: ${e}`)
    }
  }

  /**
   * 清除启动标记
   */
  private clearStartupMarker(): void {
    try {
      const markerPath = path.join(this.crashReportDir, "startup-marker.json")
      if (fs.existsSync(markerPath)) {
        fs.unlinkSync(markerPath)
      }
    } catch (e) {
      logger.error("crash-handler", `Failed to clear startup marker: ${e}`)
    }
  }

  /**
   * 检查上次是否崩溃
   */
  private checkPreviousCrash(): boolean {
    try {
      const markerPath = path.join(this.crashReportDir, "startup-marker.json")
      // 如果存在启动标记，说明上次可能崩溃了
      if (fs.existsSync(markerPath)) {
        const markerData = JSON.parse(fs.readFileSync(markerPath, "utf8"))
        const lastStartTime = markerData.startTime
        const lastPid = markerData.pid

        logger.warn(
          "crash-handler",
          `Found previous startup marker. App may have crashed. Last PID: ${lastPid}, Last start time: ${new Date(lastStartTime).toISOString()}`,
        )

        // 查找最近的崩溃报告
        const recentCrash = this.getRecentCrashReport()

        // 显示崩溃恢复对话框
        if (recentCrash && this.options.showDialog) {
          app.whenReady().then(() => {
            this.showRecoveryDialog(recentCrash)
          })
        }

        // 清除旧的启动标记
        fs.unlinkSync(markerPath)
        return true
      }
    } catch (e) {
      logger.error("crash-handler", `Failed to check previous crash: ${e}`)
    }

    return false
  }

  /**
   * 获取最近的崩溃报告
   */
  private getRecentCrashReport(): CrashReport | null {
    try {
      // 获取所有崩溃报告文件
      const files = fs
        .readdirSync(this.crashReportDir)
        .filter(file => file.startsWith("crash-") && file.endsWith(".json"))
        .map(file => ({
          name: file,
          path: path.join(this.crashReportDir, file),
          time: fs.statSync(path.join(this.crashReportDir, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time) // 按时间降序排序

      // 读取最近的崩溃报告
      if (files.length > 0) {
        const recentFile = files[0]
        const reportData = fs.readFileSync(recentFile.path, "utf8")
        return JSON.parse(reportData) as CrashReport
      }
    } catch (e) {
      logger.error("crash-handler", `Failed to get recent crash report: ${e}`)
    }

    return null
  }

  /**
   * 显示崩溃对话框
   */
  private showCrashDialog(error: Error): void {
    try {
      const options = {
        type: "error" as const,
        title: "应用崩溃",
        message: "应用遇到了一个严重错误，即将关闭",
        detail: `错误信息: ${error.message}\n\n堆栈信息: ${error.stack}\n\n崩溃报告已保存，应用将在您点击确定后关闭。`,
        buttons: ["确定"],
        defaultId: 0,
      }

      dialog.showMessageBoxSync(options)

      // 强制退出应用
      setTimeout(() => {
        app.exit(1)
      }, 1000)
    } catch (e) {
      logger.error("crash-handler", `Failed to show crash dialog: ${e}`)
      app.exit(1)
    }
  }

  /**
   * 显示恢复对话框
   */
  private showRecoveryDialog(crashReport: CrashReport): void {
    try {
      const crashTime = new Date(crashReport.timestamp).toLocaleString()
      const errorMessage = crashReport.error.message
      const errorType = crashReport.error.type

      const options = {
        type: "warning" as const,
        title: "应用恢复",
        message: "应用上次异常退出",
        detail: `应用在 ${crashTime} 因 ${errorType} 错误崩溃: ${errorMessage}\n\n崩溃报告已保存，您可以继续使用应用或联系开发者报告此问题。`,
        buttons: ["继续", "查看详情"],
        defaultId: 0,
      }

      const response = dialog.showMessageBoxSync(options)

      // 如果用户选择查看详情
      if (response === 1) {
        // 显示详细的崩溃报告
        this.showDetailedCrashInfo(crashReport)
      }
    } catch (e) {
      logger.error("crash-handler", `Failed to show recovery dialog: ${e}`)
    }
  }

  /**
   * 显示详细的崩溃信息
   */
  private showDetailedCrashInfo(crashReport: CrashReport): void {
    try {
      const options = {
        type: "info" as const,
        title: "崩溃详情",
        message: "应用崩溃详细信息",
        detail: JSON.stringify(crashReport, null, 2),
        buttons: ["关闭"],
        defaultId: 0,
      }

      dialog.showMessageBoxSync(options)
    } catch (e) {
      logger.error("crash-handler", `Failed to show detailed crash info: ${e}`)
    }
  }

  /**
   * 设置崩溃处理选项
   */
  public setOptions(options: Partial<CrashHandlerOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 获取当前选项
   */
  public getOptions(): CrashHandlerOptions {
    return { ...this.options }
  }
}

// 创建默认实例
const crashHandler = CrashHandler.getInstance()

export default crashHandler
export { crashHandler }

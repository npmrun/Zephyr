import { app, ipcMain } from "electron"
import fs from "fs"
import path from "path"
import * as rfs from "rotating-file-stream"
import { LogLevel } from "./common"

// 日志级别名称映射
const LogLevelName: Record<LogLevel, string> = {
  [LogLevel.TRACE]: "TRACE",
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: "INFO",
  [LogLevel.WARN]: "WARN",
  [LogLevel.ERROR]: "ERROR",
  [LogLevel.FATAL]: "FATAL",
  [LogLevel.OFF]: "OFF",
}

// 日志颜色映射（控制台输出用）
const LogLevelColor: Record<LogLevel, string> = {
  [LogLevel.TRACE]: "\x1b[90m", // 灰色
  [LogLevel.DEBUG]: "\x1b[36m", // 青色
  [LogLevel.INFO]: "\x1b[32m", // 绿色
  [LogLevel.WARN]: "\x1b[33m", // 黄色
  [LogLevel.ERROR]: "\x1b[31m", // 红色
  [LogLevel.FATAL]: "\x1b[35m", // 紫色
  [LogLevel.OFF]: "", // 无色
}

// 重置颜色的ANSI代码
const RESET_COLOR = "\x1b[0m"

// 日志配置接口
export interface LoggerOptions {
  level?: LogLevel // 日志级别
  namespace?: string // 日志命名空间
  console?: boolean // 是否输出到控制台
  file?: boolean // 是否输出到文件
  maxSize?: string // 单个日志文件最大大小
  maxFiles?: number // 保留的最大日志文件数量
}

// 默认配置
const DEFAULT_OPTIONS: LoggerOptions = {
  level: LogLevel.INFO,
  namespace: "app",
  console: true,
  file: true,
  maxSize: "10M",
  maxFiles: 10,
}

let logDir
const isElectronApp = !!process.versions.electron
if (isElectronApp && app) {
  logDir = path.join(app.getPath("logs"))
} else {
  // 非Electron环境下使用当前目录下的logs文件夹
  logDir = path.join(process.cwd(), "logs")
}

/**
 * 日志管理类
 */
export class Logger {
  private static instance: Logger
  private options: LoggerOptions = DEFAULT_OPTIONS
  private logStream: rfs.RotatingFileStream | null = null
  private logDir: string = logDir
  private currentLogFile: string = ""
  private isElectronApp: boolean = !!process.versions.electron
  private callInitialize: boolean = false

  /**
   * 获取单例实例
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    if (Logger.instance.callInitialize) {
      return Logger.instance
    } else {
      // 创建代理对象，确保只有在初始化后才能访问除init之外的方法
      const handler = {
        get: function (target: any, prop: string) {
          if (prop === "init") {
            return target[prop]
          }
          if (!target.callInitialize) {
            throw new Error(`Logger未初始化，不能调用${prop}方法，请先调用init()方法`)
          }
          return target[prop]
        },
      }
      Logger.instance = new Proxy(new Logger(), handler)
    }
    return Logger.instance
  }

  /**
   * 构造函数
   */
  private constructor() {}

  public init(options?: LoggerOptions): void {
    this.callInitialize = true
    this.options = { ...this.options, ...options }

    // 确保日志目录存在
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }

    // 初始化日志文件
    this.initLogFile()

    // 如果在主进程中，设置IPC监听器接收渲染进程的日志
    if (this.isElectronApp && process.type === "browser") {
      this.setupIPC()
    }
  }

  /**
   * 初始化日志文件
   */
  private initLogFile(): void {
    if (!this.options.file) return

    // 生成日志文件名
    const now = new Date()
    const timestamp = now.toISOString().replace(/[:.]/g, "-")
    this.currentLogFile = `app-logger-${timestamp}.log`

    // 创建日志流
    this.logStream = rfs.createStream(this.currentLogFile, {
      path: this.logDir,
      size: this.options.maxSize,
      rotate: this.options.maxFiles,
    })
  }

  /**
   * 设置IPC通信，接收渲染进程日志
   */
  private setupIPC(): void {
    if (!ipcMain) return
    ipcMain.on("logger:log", (_, level: LogLevel, namespace: string, ...messages: any[]) => {
      this.logWithLevel(level, namespace, ...messages)
    })

    // 处理日志级别设置请求
    ipcMain.on("logger:setLevel", (_, level: LogLevel) => {
      this.setLevel(level)
    })
  }

  /**
   * 关闭日志流
   */
  public close(): void {
    if (this.logStream) {
      this.logStream.end()
      this.logStream.destroy()
      this.logStream = null
    }
  }

  /**
   * 设置日志级别
   */
  public setLevel(level: LogLevel): void {
    this.options.level = level
  }

  /**
   * 获取当前日志级别
   */
  public getLevel(): LogLevel {
    return this.options.level || LogLevel.INFO
  }

  /**
   * 根据级别记录日志
   */
  private logWithLevel(level: LogLevel, namespace: string, ...messages: any[]): void {
    // 检查日志级别
    if (level < this.getLevel() || level === LogLevel.OFF) return

    const timestamp = new Date().toISOString()
    const levelName = LogLevelName[level]
    const prefix = `[${timestamp}] [${namespace}] [${levelName}]`

    // 格式化消息
    const formattedMessages = messages.map(msg => {
      if (typeof msg === "object") {
        try {
          return JSON.stringify(msg)
        } catch (e) {
          return String(msg)
        }
      }
      return String(msg)
    })

    const message = formattedMessages.join(" ")

    // 输出到控制台
    if (this.options.console) {
      const color = LogLevelColor[level]
      console.log(`${color}${prefix} ${message}${RESET_COLOR}`)
    }

    // 写入日志文件
    if (this.options.file && this.logStream) {
      this.logStream.write(`${prefix} ${message}\n`)
    }
  }

  /**
   * 记录跟踪级别日志
   */
  public trace(namespace: string, ...messages: any[]): void {
    this.logWithLevel(LogLevel.TRACE, namespace, ...messages)
  }

  /**
   * 记录调试级别日志
   */
  public debug(namespace: string, ...messages: any[]): void {
    this.logWithLevel(LogLevel.DEBUG, namespace, ...messages)
  }

  /**
   * 记录信息级别日志
   */
  public info(namespace: string, ...messages: any[]): void {
    this.logWithLevel(LogLevel.INFO, namespace, ...messages)
  }

  /**
   * 记录警告级别日志
   */
  public warn(namespace: string, ...messages: any[]): void {
    this.logWithLevel(LogLevel.WARN, namespace, ...messages)
  }

  /**
   * 记录错误级别日志
   */
  public error(namespace: string, ...messages: any[]): void {
    this.logWithLevel(LogLevel.ERROR, namespace, ...messages)
  }

  /**
   * 记录致命错误级别日志
   */
  public fatal(namespace: string, ...messages: any[]): void {
    this.logWithLevel(LogLevel.FATAL, namespace, ...messages)
  }
}

// 默认实例
const logger = Logger.getInstance()
logger.init()

// 应用退出时关闭日志流
if (process.type === "browser" && app) {
  app.on("before-quit", () => {
    logger.info("app", "应用关闭")
    logger.close()
  })
}

export default logger

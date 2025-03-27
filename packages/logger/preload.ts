import { contextBridge, ipcRenderer } from "electron"
import { LogLevel } from "./common"

/**
 * 渲染进程日志接口
 */
interface IRendererLogger {
  trace(namespace: string, ...messages: any[]): void
  debug(namespace: string, ...messages: any[]): void
  info(namespace: string, ...messages: any[]): void
  warn(namespace: string, ...messages: any[]): void
  error(namespace: string, ...messages: any[]): void
  fatal(namespace: string, ...messages: any[]): void
  setLevel(level: LogLevel): void
  createNamespace(namespace: string): INamespacedLogger
}

/**
 * 命名空间作用域日志接口
 */
interface INamespacedLogger {
  trace(...messages: any[]): void
  debug(...messages: any[]): void
  info(...messages: any[]): void
  warn(...messages: any[]): void
  error(...messages: any[]): void
  fatal(...messages: any[]): void
  setLevel(level: LogLevel): void
}

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

/**
 * 创建渲染进程日志对象
 */
const createRendererLogger = (): IRendererLogger => {
  // 当前日志级别
  let currentLevel: LogLevel = LogLevel.INFO

  // 格式化消息
  const formatMessages = (messages: any[]): string => {
    return messages.map(msg => {
      if (typeof msg === "object") {
        try {
          return JSON.stringify(msg)
        } catch (e) {
          return String(msg)
        }
      }
      return String(msg)
    }).join(" ")
  }

  // 本地打印日志
  const printLog = (level: LogLevel, namespace: string, ...messages: any[]): void => {
    // 检查日志级别
    if (level < currentLevel || level === LogLevel.OFF) return

    const timestamp = new Date().toISOString()
    const levelName = LogLevelName[level]
    const prefix = `[${timestamp}] [${namespace}] [${levelName}]`
    const message = formatMessages(messages)

    // 输出到控制台
    const color = LogLevelColor[level]
    console.log(`${color}${prefix} ${message}${RESET_COLOR}`)
  }

  // 通过IPC发送日志到主进程
  const sendLog = (level: LogLevel, namespace: string, ...messages: any[]) => {
    // 本地打印
    printLog(level, namespace, ...messages)

    // 发送到主进程
    ipcRenderer.send("logger:log", level, namespace, ...messages)
  }

  return {
    trace(namespace: string, ...messages: any[]): void {
      sendLog(LogLevel.TRACE, namespace, ...messages)
    },
    debug(namespace: string, ...messages: any[]): void {
      sendLog(LogLevel.DEBUG, namespace, ...messages)
    },
    info(namespace: string, ...messages: any[]): void {
      sendLog(LogLevel.INFO, namespace, ...messages)
    },
    warn(namespace: string, ...messages: any[]): void {
      sendLog(LogLevel.WARN, namespace, ...messages)
    },
    error(namespace: string, ...messages: any[]): void {
      sendLog(LogLevel.ERROR, namespace, ...messages)
    },
    fatal(namespace: string, ...messages: any[]): void {
      sendLog(LogLevel.FATAL, namespace, ...messages)
    },
    setLevel(level: LogLevel): void {
      // 更新本地日志级别
      currentLevel = level
      // 设置日志级别（可选，如果需要在渲染进程中动态调整日志级别）
      ipcRenderer.send("logger:setLevel", level)
    },
    createNamespace(namespace: string): INamespacedLogger {
      return {
        trace: (...messages: any[]) => sendLog(LogLevel.TRACE, namespace, ...messages),
        debug: (...messages: any[]) => sendLog(LogLevel.DEBUG, namespace, ...messages),
        info: (...messages: any[]) => sendLog(LogLevel.INFO, namespace, ...messages),
        warn: (...messages: any[]) => sendLog(LogLevel.WARN, namespace, ...messages),
        error: (...messages: any[]) => sendLog(LogLevel.ERROR, namespace, ...messages),
        fatal: (...messages: any[]) => sendLog(LogLevel.FATAL, namespace, ...messages),
        setLevel: (level: LogLevel) => {
          currentLevel = level
          ipcRenderer.send("logger:setLevel", level)
        }
      }
    },
  }
}

// 暴露logger对象到渲染进程全局
contextBridge.exposeInMainWorld("logger", createRendererLogger())

// 导出类型定义，方便在渲染进程中使用
export type { IRendererLogger }

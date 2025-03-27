import { contextBridge, ipcRenderer } from "electron"
import { LogLevel, LogLevelName } from "./common"
import logger from "./preload"

/**
 * 错误详情接口
 */
export interface ErrorDetail {
  message: string
  stack?: string
  componentInfo?: string
  additionalInfo?: Record<string, any>
  timestamp: string
  type: string
}

/**
 * 错误处理配置
 */
export interface ErrorHandlerOptions {
  namespace?: string
  level?: LogLevel
  includeStack?: boolean
  includeComponentInfo?: boolean
}

/**
 * 渲染进程错误处理接口
 */
interface IRendererErrorHandler {
  /**
   * 捕获错误
   */
  captureError(error: any, componentInfo?: string, additionalInfo?: Record<string, any>): void

  /**
   * 设置错误处理选项
   */
  setOptions(options: Partial<ErrorHandlerOptions>): void

  /**
   * 获取当前选项
   */
  getOptions(): ErrorHandlerOptions

  /**
   * 安装全局错误处理器
   */
  installGlobalHandlers(): void
}

/**
 * 默认错误处理配置
 */
const DEFAULT_OPTIONS: ErrorHandlerOptions = {
  namespace: "error",
  level: LogLevel.ERROR,
  includeStack: true,
  includeComponentInfo: true,
}

/**
 * 格式化错误信息
 */
const formatError = (error: any, options: ErrorHandlerOptions): ErrorDetail => {
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
    if (options.includeStack) {
      errorDetail.stack = error.stack
    }
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

  return errorDetail
}

/**
 * 创建渲染进程错误处理器
 */
const createRendererErrorHandler = (): IRendererErrorHandler => {
  // 当前错误处理选项
  let options: ErrorHandlerOptions = { ...DEFAULT_OPTIONS }

  /**
   * 发送错误到主进程
   */
  const sendError = (error: any, componentInfo?: string, additionalInfo?: Record<string, any>) => {
    const errorDetail = formatError(error, options)

    // 添加组件信息
    if (options.includeComponentInfo && componentInfo) {
      errorDetail.componentInfo = componentInfo
    }

    // 使用logger记录错误
    const namespace = options.namespace || "error"
    const level = LogLevelName[options.level || LogLevel.ERROR].toLowerCase()

    // 添加额外信息
    if (additionalInfo) {
      errorDetail.additionalInfo = {
        ...errorDetail.additionalInfo,
        ...additionalInfo,
      }
    }

    // 通过logger直接记录错误，不再使用IPC通信
    logger[level](namespace, JSON.stringify(errorDetail))

    // 同时在控制台输出错误信息
    logger[level](namespace, `${errorDetail.type}: ${errorDetail.message}`)
    if (errorDetail.stack) {
      logger[level](namespace, `Stack: ${errorDetail.stack}`)
    }
  }

  /**
   * 安装全局错误处理器
   */
  const installGlobalHandlers = () => {
    // 捕获未处理的异常
    window.addEventListener("error", event => {
      event.preventDefault()
      sendError(event.error || event.message, "window.onerror", {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      })
      return true
    })

    // 捕获未处理的Promise拒绝
    window.addEventListener("unhandledrejection", event => {
      event.preventDefault()
      sendError(event.reason, "unhandledrejection", {
        promise: "[Promise]", // 不能直接序列化Promise对象
      })
      return true
    })

    // 捕获资源加载错误
    document.addEventListener(
      "error",
      event => {
        // 只处理资源加载错误
        if (event.target && (event.target as HTMLElement).tagName) {
          const target = event.target as HTMLElement
          sendError(`Resource load failed: ${(target as any).src || (target as any).href}`, "resource.error", {
            tagName: target.tagName,
            src: (target as any).src,
            href: (target as any).href,
          })
        }
      },
      true,
    ) // 使用捕获阶段

    logger.info("[ErrorHandler] Global error handlers installed")
  }

  return {
    captureError: sendError,
    setOptions: (newOptions: Partial<ErrorHandlerOptions>) => {
      options = { ...options, ...newOptions }
      // 同步选项到主进程
      ipcRenderer.send("logger:errorOptions", options)
    },
    getOptions: () => ({ ...options }),
    installGlobalHandlers,
  }
}

const errorHandler = createRendererErrorHandler()
errorHandler.installGlobalHandlers()

// 暴露错误处理器到渲染进程全局
contextBridge.exposeInMainWorld("errorHandler", errorHandler)

// 导出类型定义，方便在渲染进程中使用
export type { IRendererErrorHandler }

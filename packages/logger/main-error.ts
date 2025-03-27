import { LogLevel, LogLevelName } from "./common"
import logger from "./main"

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
  formatError?: (error: any) => ErrorDetail
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
  // 如果已经是ErrorDetail格式，直接返回
  if (error && typeof error === "object" && error.type && error.message && error.timestamp) {
    return error as ErrorDetail
  }

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
 * 错误处理类
 */
export class ErrorHandler {
  private options: ErrorHandlerOptions

  constructor(options?: Partial<ErrorHandlerOptions>) {
    this.options = { ...DEFAULT_OPTIONS, ...options }
  }

  /**
   * 记录错误
   */
  public captureError(error: any, componentInfo?: string, additionalInfo?: Record<string, any>): void {
    const errorDetail = formatError(error, this.options)

    // 添加组件信息
    if (this.options.includeComponentInfo && componentInfo) {
      errorDetail.componentInfo = componentInfo
    }

    // 添加额外信息
    if (additionalInfo) {
      errorDetail.additionalInfo = {
        ...errorDetail.additionalInfo,
        ...additionalInfo,
      }
    }

    // 使用logger记录错误
    const namespace = this.options.namespace || "error"
    const level = LogLevelName[this.options.level || LogLevel.ERROR].toLowerCase()

    // 构建错误消息
    let errorMessage = `${errorDetail.type}: ${errorDetail.message}`
    if (errorDetail.componentInfo) {
      errorMessage += ` | Component: ${errorDetail.componentInfo}`
    }

    // 记录错误
    logger[level](namespace, errorMessage)

    // 如果有堆栈信息，单独记录
    if (errorDetail.stack) {
      logger[level](namespace, `Stack: ${errorDetail.stack}`)
    }

    // 如果有额外信息，单独记录
    if (errorDetail.additionalInfo) {
      try {
        const additionalInfoStr = JSON.stringify(errorDetail.additionalInfo, null, 2)
        logger[level](namespace, `Additional Info: ${additionalInfoStr}`)
      } catch (e) {
        logger[level](namespace, "Additional Info: [Unserializable]")
      }
    }
  }

  /**
   * 设置错误处理选项
   */
  public setOptions(options: Partial<ErrorHandlerOptions>): void {
    this.options = { ...this.options, ...options }
  }

  /**
   * 获取当前选项
   */
  public getOptions(): ErrorHandlerOptions {
    return { ...this.options }
  }
}

// 创建默认实例
const errorHandler = new ErrorHandler()

// 捕获未处理的Promise异常
process.on("unhandledRejection", reason => {
  errorHandler.captureError(reason)
})

// 捕获未捕获的异常
process.on("uncaughtException", error => {
  errorHandler.captureError(error)
})

export default errorHandler

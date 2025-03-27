// 日志级别定义
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
  OFF = 6,
}
// 日志级别名称映射
export const LogLevelName: Record<LogLevel, string> = {
  [LogLevel.TRACE]: "TRACE",
  [LogLevel.DEBUG]: "DEBUG",
  [LogLevel.INFO]: "INFO",
  [LogLevel.WARN]: "WARN",
  [LogLevel.ERROR]: "ERROR",
  [LogLevel.FATAL]: "FATAL",
  [LogLevel.OFF]: "OFF",
}

// 日志颜色映射（控制台输出用）
export const LogLevelColor: Record<LogLevel, string> = {
  [LogLevel.TRACE]: "\x1b[90m", // 灰色
  [LogLevel.DEBUG]: "\x1b[36m", // 青色
  [LogLevel.INFO]: "\x1b[32m", // 绿色
  [LogLevel.WARN]: "\x1b[33m", // 黄色
  [LogLevel.ERROR]: "\x1b[31m", // 红色
  [LogLevel.FATAL]: "\x1b[35m", // 紫色
  [LogLevel.OFF]: "", // 无色
}

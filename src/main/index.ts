import "reflect-metadata"
import { _ioc } from "main/_ioc"
import { App } from "main/App"

import debug from "debug"
import fs from "fs"
import path from "path"
import * as rfs from "rotating-file-stream"
import { app } from "electron"

// 配置根目录
const logsPath = app.getPath("logs")
console.log(`日志地址：${logsPath}`)

const LOG_ROOT = path.join(logsPath)

// 缓存已创建的文件流（避免重复创建）
const streams = new Map()

// 转换命名空间为安全路径
function sanitizeNamespace(namespace) {
  return namespace
    .split(":") // 按层级分隔符拆分
    .map(part => part.replace(/[\\/:*?"<>|]/g, "_")) // 替换非法字符
    .join(path.sep) // 拼接为系统路径分隔符（如 / 或 \）
}

// 覆盖 debug.log 方法
const originalLog = debug.log
debug.log = function (...args) {
  // 保留原始控制台输出（可选）
  originalLog.apply(this, args)
  // 获取当前命名空间
  // @ts-ignore ...
  const namespace = this.namespace
  if (!namespace) {
    // TODO 增加容错机制，如果没有命名空间就输出到一个默认文件中
    return
  }

  // 生成日志文件路径（示例：logs/app/server.log）
  const sanitizedPath = sanitizeNamespace(namespace)
  // const logFilePath = path.join(LOG_ROOT, `${sanitizedPath}.log`)

  const today = new Date().toISOString().split("T")[0]
  const logFilePath = path.join(LOG_ROOT, sanitizedPath, `${today}.log`)

  // 确保目录存在
  const dir = path.dirname(logFilePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true }) // 自动创建多级目录
  }

  // 获取或创建文件流
  let stream = streams.get(logFilePath)
  if (!stream) {
    // stream = fs.createWriteStream(logFilePath, { flags: "a" }) // 追加模式
    stream = rfs.createStream(path.parse(logFilePath).base, {
      path: dir,
      size: "10M", // 单个文件最大 10MB
      rotate: 5, // 保留最近 5 个文件
    })
    streams.set(logFilePath, stream)
  }

  // 写入日志（添加时间戳）
  const message = args.join(" ")
  stream.write(`${message}\n`)

  // const timestamp = new Date().toISOString()
  // stream.write(`[${timestamp}] ${message}\n`)
}

const curApp = _ioc.get(App)
curApp.init()

const _debug = debug("app:app")
app.on("before-quit", () => {
  _debug("应用关闭")
  streams.forEach(stream => {
    stream.end()
    stream.destroy()
  })
  streams.clear()
})

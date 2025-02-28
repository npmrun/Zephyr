import { session, net } from "electron"
import { injectable } from "inversify"
import BaseClass from "main/base/base"
import _debug from "debug"
import fs from "fs"
import path from "path"
import { app } from "electron"

const debug = _debug("app:zephyr")

/**
 * Zephyr 模块 - 安全的本地文件访问协议
 *
 * 使用说明：
 * 1. 访问格式：zephyr://<操作>/<文件路径>
 *    操作类型：
 *    - r/  : 只读访问（read）
 *    - w/  : 写入访问（write）[未实现]
 *    - rw/ : 读写访问（read-write）[未实现]
 *    - t/  : 临时文件访问（temp）[未实现]
 *
 * 2. 访问示例：
 *    - 只读文件：zephyr://r/D:/documents/test.txt
 *    - 应用数据：zephyr://r/app-data/config.json
 *    - 临时文件：zephyr://t/cache/temp.json
 *
 * 3. 安全限制：
 *    - 仅支持以下文件类型：.txt, .json, .md
 *    - 必须在 ALLOWED_PATHS 白名单中的路径才能访问
 *    - 不同操作类型有不同的权限控制
 *
 * 4. 配置示例：
 *    ```typescript
 *    zephyr.setAllowedPaths({
 *      // 只读路径
 *      read: [
 *        "D:/documents",
 *        app.getPath("documents")
 *      ],
 *      // 临时文件路径
 *      temp: [
 *        app.getPath("temp")
 *      ]
 *    });
 *    ```
 */

/**
 *
 *  配置写入权限
zephyr.setAllowedPaths({
    write: [
        path.join(app.getPath("userData"), "data"),
        "D:/allowed-write-path"
    ]
})

// 写入文件
fetch("zephyr://w/path/to/file.json", {
    method: "POST",
    body: JSON.stringify({ data: "test" })
})

// 写入文本
fetch("zephyr://w/path/to/file.txt", {
    method: "POST",
    body: "Hello World"
})
 */

@injectable()
class Zephyr extends BaseClass {
    // private readonly ALLOWED_PATHS: string[] = [] // 可以在这里定义允许访问的路径白名单
    private readonly ALLOWED_EXTENSIONS: string[] = [".txt", ".json", ".md"] // 允许的文件类型
    private readonly MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
    // private readonly SAFE_PATH_PATTERN = /^[a-zA-Z0-9\s\-_\/\\:\.]+$/

    // 定义操作类型
    private readonly OPERATIONS = {
        READ: "r",
        WRITE: "w",
        READWRITE: "rw",
        TEMP: "t",
    } as const

    private readonly pathConfig: {
        read: string[]
        temp: string[]
        write: string[]
    } = {
        read: [],
        temp: [],
        write: [],
    }

    // 文件锁定相关
    private readonly fileLocks = new Map<string, boolean>()

    // 访问频率限制相关
    private readonly rateLimiter = new Map<string, number>()
    private readonly MAX_REQUESTS = 10 // 每个文件在时间窗口内的最大请求次数
    private readonly WINDOW_MS = 60000 // 时间窗口：1分钟

    // 审计日志相关
    private readonly LOG_FILE = path.join(app.getPath("logs"), "zephyr-access.log")

    constructor() {
        super()
        this.interceptHandlerZephyr = this.interceptHandlerZephyr.bind(this)
        this.initLogFile()
        debug("zephyr init")
    }

    private async initLogFile() {
        const logDir = path.dirname(this.LOG_FILE)
        await fs.promises.mkdir(logDir, { recursive: true })
    }

    // 文件锁定机制
    private async acquireFileLock(filePath: string): Promise<boolean> {
        if (this.fileLocks.get(filePath)) {
            return false
        }
        this.fileLocks.set(filePath, true)
        return true
    }

    private releaseFileLock(filePath: string): void {
        this.fileLocks.delete(filePath)
    }

    // 访问频率限制
    private isRateLimited(filePath: string): boolean {
        // const now = Date.now()
        const count = this.rateLimiter.get(filePath) || 0

        if (count >= this.MAX_REQUESTS) {
            debug("访问频率超限:", filePath)
            return true
        }

        this.rateLimiter.set(filePath, count + 1)
        setTimeout(() => {
            const currentCount = this.rateLimiter.get(filePath)
            if (currentCount && currentCount > 0) {
                this.rateLimiter.set(filePath, currentCount - 1)
            }
        }, this.WINDOW_MS)

        return false
    }

    // 审计日志
    private async logAccess(operation: string, filePath: string, success: boolean, details?: string) {
        const timestamp = new Date().toISOString()
        const logEntry = {
            timestamp,
            operation,
            filePath,
            success,
            details,
        }

        try {
            await fs.promises.appendFile(this.LOG_FILE, JSON.stringify(logEntry) + "\n", "utf8")
        } catch (error) {
            debug("写入审计日志失败:", error)
        }
    }

    // 文件内容验证
    private async validateFileContent(filePath: string): Promise<boolean> {
        try {
            const ext = path.extname(filePath).toLowerCase()
            const content = await fs.promises.readFile(filePath, "utf8")

            switch (ext) {
                case ".json":
                    JSON.parse(content)
                    return true
                case ".md":
                    // 可以添加 Markdown 验证逻辑
                    return content.length > 0
                case ".txt":
                    // 文本文件验证
                    return content.length > 0
                default:
                    return false
            }
        } catch {
            return false
        }
    }

    destroy() {
        const ses = session.defaultSession
        ses.protocol.unhandle("zephyr")
        this.fileLocks.clear()
        this.rateLimiter.clear()
        debug("zephyr destroyed")
    }

    init(partition?: string) {
        const ses = partition ? session.fromPartition(partition) : session.defaultSession
        ses.protocol.handle("zephyr", this.interceptHandlerZephyr)
        debug("zephyr initialized with partition:", partition)
    }

    setAllowedPaths(config: Partial<typeof this.pathConfig>) {
        Object.assign(this.pathConfig, config)
        debug("Updated allowed paths:", this.pathConfig)
    }

    private isValidPath(filePath: string): boolean {
        try {
            // 规范化路径
            const normalizedPath = path.normalize(filePath)

            // Windows 路径特殊处理
            const isWindowsPath = /^[a-z]:/i.test(normalizedPath)

            // 检查基本字符（排除特殊字符）
            // 允许驱动器冒号，但排除其他特殊字符
            const basicCheck = isWindowsPath ? /^[a-z]:[^<>"|?*]+$/i.test(normalizedPath) : /^[^<>:"|?*]+$/i.test(normalizedPath)

            return basicCheck && (isWindowsPath || normalizedPath.startsWith("/"))
        } catch {
            return false
        }
    }

    private async isPathSafe(filePath: string, operation: string): Promise<boolean> {
        try {
            // 1. 基本路径检查
            if (!this.isValidPath(filePath)) {
                debug("不安全的路径字符:", filePath)
                return false
            }

            // 2. 检查是否包含 .. 路径
            if (filePath.includes("..")) {
                debug("检测到路径遍历尝试")
                return false
            }

            // 3. 检查符号链接
            if (await this.isSymlink(filePath)) {
                debug("不允许访问符号链接")
                return false
            }

            // 4. 检查文件大小
            if (!(await this.checkFileSize(filePath))) {
                debug("文件超出大小限制")
                return false
            }

            // 5. 文件类型检查
            const ext = path.extname(filePath).toLowerCase()
            if (!this.ALLOWED_EXTENSIONS.includes(ext)) {
                debug("不允许的文件类型:", ext)
                return false
            }

            // 6. 权限检查
            const allowedPaths = this.getPathsByOperation(operation)
            if (!allowedPaths) return false

            // 7. 确保路径在允许范围内
            const isInAllowedPath = allowedPaths.some(allowedPath => {
                const resolvedAllowed = path.resolve(allowedPath)
                const resolvedTarget = path.resolve(filePath)
                return resolvedTarget.startsWith(resolvedAllowed)
            })

            if (!isInAllowedPath) {
                debug("路径不在允许范围内")
                return false
            }

            // 添加频率限制检查
            if (this.isRateLimited(filePath)) {
                await this.logAccess(operation, filePath, false, "访问频率超限")
                return false
            }

            // 添加文件内容验证
            if (!(await this.validateFileContent(filePath))) {
                await this.logAccess(operation, filePath, false, "文件内容验证失败")
                return false
            }

            await this.logAccess(operation, filePath, true)
            return true
        } catch (error: any) {
            await this.logAccess(operation, filePath, false, error.message)
            debug("路径安全检查错误:", error)
            return false
        }
    }

    async interceptHandlerZephyr(request: Request): Promise<Response> {
        try {
            if (!request.url.startsWith("zephyr://")) {
                return net.fetch(request.url, request)
            }

            const urlParts = request.url.replace(/^zephyr:\/\//, "").split("/")
            const operation = urlParts[0]
            const filePath = path.normalize(urlParts.slice(1).join("/"))

            if (!operation || !filePath) {
                return new Response("Invalid URL format", { status: 400 })
            }

            if (!(await this.isPathSafe(filePath, operation))) {
                debug("访问被拒绝:", filePath)
                return new Response("Access Denied", { status: 403 })
            }

            // 处理不同的操作类型
            switch (operation) {
                case this.OPERATIONS.READ:
                    return await this.handleReadOperation(filePath)
                case this.OPERATIONS.WRITE:
                    return await this.handleWriteOperation(filePath, request)
                default:
                    return new Response("Operation not supported", { status: 400 })
            }
        } catch (error) {
            debug("处理请求错误:", error)
            return new Response("Internal Server Error", { status: 500 })
        }
    }

    private async handleReadOperation(filePath: string): Promise<Response> {
        const cleanup = async (error?: Error): Promise<Response> => {
            this.releaseFileLock(filePath)
            if (error) {
                await this.logAccess("READ", filePath, false, error.message)
                return new Response("Internal Server Error", { status: 500 })
            }
            return new Response("OK", { status: 200 })
        }

        try {
            if (!(await this.acquireFileLock(filePath))) {
                await this.logAccess("READ", filePath, false, "文件已锁定")
                return new Response("File is locked", { status: 423 })
            }

            const stream = fs.createReadStream(filePath, {
                flags: "r",
                encoding: "utf8",
            })

            const timeout = setTimeout(() => {
                stream.destroy()
                cleanup(new Error("读取超时"))
            }, 5000)

            const response = new Response(stream as any, {
                status: 200,
                headers: {
                    "content-type": this.getContentType(filePath),
                    "cache-control": "no-cache",
                },
            })

            stream.on("error", error => {
                clearTimeout(timeout)
                cleanup(error)
            })

            stream.on("end", () => {
                clearTimeout(timeout)
                cleanup()
            })

            return response
        } catch (error) {
            return await cleanup(error as Error)
        }
    }

    private getContentType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase()
        const contentTypes: Record<string, string> = {
            ".txt": "text/plain",
            ".json": "application/json",
            ".md": "text/markdown",
        }
        return contentTypes[ext] || "application/octet-stream"
    }

    private async isSymlink(filePath: string): Promise<boolean> {
        try {
            const stats = await fs.promises.lstat(filePath)
            return stats.isSymbolicLink()
        } catch {
            return false
        }
    }

    private async checkFileSize(filePath: string): Promise<boolean> {
        try {
            const stats = await fs.promises.stat(filePath)
            return stats.size <= this.MAX_FILE_SIZE
        } catch {
            return false
        }
    }

    private getPathsByOperation(operation: string): string[] | null {
        switch (operation) {
            case this.OPERATIONS.READ:
                return this.pathConfig.read
            case this.OPERATIONS.TEMP:
                return this.pathConfig.temp
            case this.OPERATIONS.WRITE:
                return this.pathConfig.write
            default:
                debug("未知的操作类型:", operation)
                return null
        }
    }

    private async handleWriteOperation(filePath: string, request: Request): Promise<Response> {
        const cleanup = async (error?: Error): Promise<Response> => {
            this.releaseFileLock(filePath)
            if (error) {
                await this.logAccess("WRITE", filePath, false, error.message)
                return new Response("Write failed: " + error.message, { status: 500 })
            }
            return new Response("Write successful", { status: 200 })
        }

        try {
            // 1. 获取文件锁
            if (!(await this.acquireFileLock(filePath))) {
                return new Response("File is locked", { status: 423 })
            }

            // 2. 确保目标目录存在
            await fs.promises.mkdir(path.dirname(filePath), { recursive: true })

            // 3. 获取请求内容
            const content = await request.text()

            // 4. 验证内容大小
            if (content.length > this.MAX_FILE_SIZE) {
                return cleanup(new Error("Content too large"))
            }

            // 5. 验证文件类型和内容
            const ext = path.extname(filePath).toLowerCase()
            if (ext === ".json") {
                try {
                    JSON.parse(content)
                } catch {
                    return cleanup(new Error("Invalid JSON content"))
                }
            }

            // 6. 写入文件
            await fs.promises.writeFile(filePath, content, "utf8")
            await this.logAccess("WRITE", filePath, true)

            return cleanup()
        } catch (error) {
            return cleanup(error as Error)
        }
    }
}

export default Zephyr
export { Zephyr }

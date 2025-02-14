import { session, net } from "electron"
import { inject, injectable } from "inversify"
import IOC from "main/_ioc"
import BaseClass from "main/base/base"
import _debug from "debug"

const debug = _debug("app:zephyr")

@injectable()
class Zephyr extends BaseClass {
    constructor(@inject(IOC) private _IOC: IOC) {
        super()
        this.interceptHandlerZephyr = this.interceptHandlerZephyr.bind(this)
        debug("aaaaaaaaaaaaaaaaaaaaaa")
    }

    destroy() {
        // TODO
    }
    init(partition?: string) {
        const ses = partition ? session.fromPartition(partition) : session.defaultSession
        ses.protocol.handle("zephyr", this.interceptHandlerZephyr)
        console.log(32423)
    }
    async interceptHandlerZephyr(request: Request) {
        if (request.url.startsWith("zephyr://")) {
            let curPath = request.url.replace(/^zephyr:\/\//, "")
            let isPathRead = false
            if (curPath.startsWith("$path/")) {
                isPathRead = true
                curPath = curPath.replace(/^\$path\//, "")
            }
            if (isPathRead) {
                console.log("安全读取本地目录")
                // 检查文件的安全性
                const headers: HeadersInit = {}
                headers["content-type"] = "text/txt"
                return new Response(curPath, {
                    status: 200,
                    headers: Object.keys(headers).length ? headers : undefined,
                })
            }
        }
        return net.fetch(request.url, request)
    }
}

export default Zephyr
export { Zephyr }

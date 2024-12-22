import { session, net } from "electron"
import { inject, injectable } from "inversify"
import IOC from "vc/_ioc"
import BaseClass from "vc/base/base"

@injectable()
class Api extends BaseClass {
    constructor(@inject(IOC) private _IOC: IOC) {
        super()
        this.interceptHandler = this.interceptHandler.bind(this)
    }

    destroy() {
        // TODO
    }
    init(partition?: string) {
        // const ses = partition ? session.fromPartition(partition) : session.defaultSession
        const ses = partition ? session.fromPartition(partition) : session.defaultSession
        ses.protocol.handle("api", this.interceptHandler)
    }
    async interceptHandler(request: Request) {
        if (request.url.startsWith("api://fuck/")) {
            let curUrl = request.url
            const isScriteText = curUrl.endsWith("?script")
            if (isScriteText) {
                curUrl = curUrl.replace("?script", "")
            }
            const isPost = request.method.toLowerCase() === "post"
            const file = curUrl.replace("api://fuck/", "")
            const array = file.split("/")
            const routePath = array.slice(0, -1).join("/")
            const fnName = array[array.length - 1]
            // https://vitejs.cn/vite5-cn/guide/features.html#dynamic-import
            const module = await this._IOC.getAsync(routePath)
            // const module = await import(`vc/controller/${routePath}.ts`)
            const opts = { body: {}, query: {} }
            if (isPost) {
                opts.body = await request.json()
            }
            const headers: HeadersInit = {}
            if (isScriteText) {
                headers["content-type"] = "text/javascript"
            }
            if (isPost) {
                headers["content-type"] = "application/json"
            }
            if (module && module[fnName]) {
                if (typeof module[fnName] === "string") {
                    const result = module[fnName]
                    return new Response(result, {
                        status: 200,
                        headers: Object.keys(headers).length ? headers : undefined,
                    })
                }
                if (typeof module[fnName] === "function") {
                    let result = await module[fnName](opts)
                    if (typeof result === "object") {
                        result = JSON.stringify(result)
                    }
                    return new Response(result, {
                        status: 200,
                        headers: Object.keys(headers).length ? headers : undefined,
                    })
                }
                if (typeof module[fnName] === "object") {
                    let result = module[fnName]
                    if (typeof result === "object") {
                        result = JSON.stringify(result)
                    }
                    return new Response(result, {
                        status: 200,
                        headers: Object.keys(headers).length ? headers : undefined,
                    })
                }
            }
            return new Response("", {
                status: 500,
                headers: Object.keys(headers).length ? headers : undefined,
            })
        } else if (request.url.startsWith("api://")) {
            return new Response("error", {
                status: 500,
            })
        }
        return net.fetch(request.url, request)
    }
}

export default Api
export { Api }

import { IApiClient } from "./abstract"

export class BrowserApiClient implements IApiClient {
  call<T = any>(command: string, ...args: any[]): Promise<T> {
    // 浏览器特定实现，可能使用 fetch 或其他方式
    const [service, method] = command.split(".")
    return fetch(`/api/${service}/${method}`, {
      method: "POST",
      body: JSON.stringify(args),
      headers: { "Content-Type": "application/json" },
    }).then(res => res.json())
  }

  callSync(): void {
    // 浏览器特定实现，可能使用 fetch 或其他方式
    console.log("不支持 callSync 方法")
  }

  // 实现其他方法...
  on<K extends string>(channel: K, callback: (...args: any[]) => void): void {
    // 浏览器中可能使用 WebSocket 或其他方式
    console.log("不支持 on 方法", channel, callback)
  }

  off<K extends string>(channel: K, callback: (...args: any[]) => void): void {
    // 相应的解绑实现
    console.log("不支持 on 方法", channel, callback)
  }

  offAll<K extends string>(channel: K): void {
    // 相应的全部解绑实现
    console.log("不支持 on 方法", channel)
  }
}

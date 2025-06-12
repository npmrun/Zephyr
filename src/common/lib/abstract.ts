import { ElectronApiClient } from "common/lib/electron"
import { BrowserApiClient } from "common/lib/browser"
import { BaseSingleton } from "base/index"

// 定义抽象 API 接口
export interface IApiClient {
  call<T = any>(command: string, ...args: any[]): Promise<T>
  callSync(command: string, ...args: any[]): void
  on<K extends string>(channel: K, callback: (...args: any[]) => void): void
  off<K extends string>(channel: K, callback: (...args: any[]) => void): void
  offAll<K extends string>(channel: K): void
}

class NullApiClient implements IApiClient {
  async call<T = any>(command: string, ...args: any[]): Promise<T> {
    args
    console.warn(`API call to ${command} failed: API client not initialized`)
    return undefined as any
  }
  callSync(command: string, ...args: any[]): void {
    args
    console.warn(`API callSync to ${command} failed: API client not initialized`)
    return undefined as any
  }

  on<K extends string>(channel: K, callback: (...args: any[]) => void): void {
    callback
    console.warn(`Failed to register listener for ${channel}: API client not initialized`)
  }

  off<K extends string>(channel: K, callback: (...args: any[]) => void): void {
    callback
    console.warn(`Failed to unregister listener for ${channel}: API client not initialized`)
  }

  offAll<K extends string>(channel: K): void {
    console.warn(`Failed to unregister all listeners for ${channel}: API client not initialized`)
  }
}

// 创建 API 工厂
export class ApiFactory {
  private static instance: IApiClient = new NullApiClient() // 默认使用空实现

  static setApiClient(client: IApiClient) {
    this.instance = client
  }

  static getApiClient(): IApiClient {
    if (this.instance instanceof NullApiClient) {
      // 根据环境选择合适的 API 客户端
      if (window.api && window.electron) {
        this.instance = new ElectronApiClient()
      } else {
        this.instance = new BrowserApiClient()
      }
    }
    return this.instance
  }
}

export class BaseEvent extends BaseSingleton {
  constructor() {
    super()
  }

  public get api() {
    return ApiFactory.getApiClient()
  }
}

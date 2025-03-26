import { IApiClient } from "./abstract"

export class ElectronApiClient implements IApiClient {
  call<T = any>(command: string, ...args: any[]): Promise<T> {
    // Electron 特定实现
    return window.api.call(command, ...args)
  }

  on<K extends string>(channel: K, callback: (...args: any[]) => void): void {
    window.api.on(channel, callback)
  }

  off<K extends string>(channel: K, callback: (...args: any[]) => void): void {
    window.api.off(channel, callback)
  }

  offAll<K extends string>(channel: K): void {
    window.api.offAll(channel)
  }
}

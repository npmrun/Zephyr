type FireFN = (...argu: any[]) => void

// 监听器类型定义，支持优先级
interface Listener<F extends FireFN> {
  fn: F
  once: boolean
  priority: number
}

class FireEvent<T extends Record<string | symbol, FireFN>> {
  // 使用 Map 存储事件监听器，支持 symbol 键
  private events = new Map<keyof T, Array<Listener<T[keyof T]>>>()

  // 获取事件监听器列表，如果不存在则创建
  private getListeners<S extends keyof T>(name: S): Array<Listener<T[S]>> {
    if (!this.events.has(name)) {
      this.events.set(name, [])
    }
    return this.events.get(name) as Array<Listener<T[S]>>
  }

  // 按优先级排序监听器
  private sortListeners<S extends keyof T>(name: S) {
    const listeners = this.getListeners(name)
    listeners.sort((a, b) => b.priority - a.priority)
  }

  // 打印事件和监听器信息
  print() {
    console.log("Registered Events:")
    this.events.forEach((listeners, name) => {
      // 显式处理 symbol 类型
      const keyType = typeof name === "symbol" ? `Symbol(${name.description || ""})` : String(name)
      console.log(`  ${keyType}: ${listeners.length} listeners`)
    })
  }

  // 添加事件监听器，支持优先级
  on<S extends keyof T>(name: S, fn: T[S], priority = 0): this {
    const listeners = this.getListeners(name)
    listeners.push({ fn, once: false, priority })
    this.sortListeners(name)
    return this // 支持链式调用
  }

  // 触发事件
  emit<S extends keyof T>(name: S, ...args: Parameters<T[S]>): this {
    const listeners = this.getListeners(name).slice() // 创建副本以避免移除时的问题

    for (const { fn } of listeners) {
      try {
        fn(...args)
      } catch (error) {
        console.error(`Error in event handler for ${String(name)}:`, error)
      }
    }

    // 移除一次性监听器
    if (listeners.some(l => l.once)) {
      this.events.set(
        name,
        this.getListeners(name).filter(l => !l.once),
      )
    }

    return this
  }

  // 移除事件监听器
  off<S extends keyof T>(name: S, fn?: T[S]): this {
    if (!this.events.has(name)) return this

    const listeners = this.getListeners(name)

    if (!fn) {
      // 移除所有监听器
      this.events.delete(name)
    } else {
      // 移除特定监听器
      const filtered = listeners.filter(l => l.fn !== fn)
      if (filtered.length === 0) {
        this.events.delete(name)
      } else {
        this.events.set(name, filtered)
      }
    }

    return this
  }

  // 添加一次性事件监听器
  once<S extends keyof T>(name: S, fn: T[S], priority = 0): this {
    const listeners = this.getListeners(name)
    listeners.push({ fn, once: true, priority })
    this.sortListeners(name)
    return this
  }

  // 清除所有事件监听器
  clear(): this {
    this.events.clear()
    return this
  }

  // 获取指定事件的监听器数量
  listenerCount<S extends keyof T>(name: S): number {
    return this.events.get(name)?.length || 0
  }

  // 检查事件是否有监听器
  hasListeners<S extends keyof T>(name: S): boolean {
    return this.listenerCount(name) > 0
  }

  // 获取所有事件名称
  eventNames(): Array<keyof T> {
    return Array.from(this.events.keys())
  }
}

export function buildEmitter<T extends Record<string | symbol, FireFN>>() {
  return new FireEvent<T>()
}

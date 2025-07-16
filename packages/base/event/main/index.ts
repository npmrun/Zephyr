// type FireKey = string
type FireFN = (...argu: any[]) => void

class FireEvent<T extends Record<string | symbol, FireFN>> {
  #events: Record<keyof T, FireFN[]> = {} as any
  print() {
    Object.keys(this.#events).forEach(key => {
      console.log(`${key}: ${this.#events[key]}\n`)
    })
  }
  on<S extends keyof T | "*">(name: S, fn: S extends "*" ? (...argus: [keyof T, T[keyof T]]) => void : T[S]) {
    if (!this.#events[name]) {
      this.#events[name] = []
    }
    this.#events[name].push(fn as any)
  }
  async emit<S extends keyof T>(name: S, ...argu: Parameters<T[S]>) {
    if (this.#events[name]) {
      const returnValues: any = []
      for (let i = 0; i < this.#events[name].length; i++) {
        const fn = this.#events[name][i]
        let r
        if (Object.prototype.toString.call(fn) === "[object AsyncFunction]") {
          r = await fn(...argu)
        } else {
          r = fn(...argu)
        }
        returnValues.push(r)
      }
    }
    if (this.#events["*"]) {
      for (let i = 0; i < this.#events["*"].length; i++) {
        const fn = this.#events["*"][i]
        fn(name, ...argu)
      }
    }
  }
  off<S extends keyof T>(name: S, fn?: T[S]) {
    const len = this.#events[name].length
    if (!len) {
      return
    }
    if (!fn) {
      this.#events[name] = []
    } else {
      for (let i = len - 1; i >= 0; i--) {
        const _fn = this.#events[name][i]
        if (_fn === fn) {
          this.#events[name].splice(i, 1)
        }
      }
    }
  }
  once<S extends keyof T>(name: S, fn: T[S]) {
    const _fn: any = (...argu: any[]) => {
      fn(...argu)
      this.off<S>(name, _fn)
    }
    this.on(name, _fn)
  }
}

export function buildEmitter<T extends Record<string | symbol, FireFN>>() {
  return new FireEvent<T>()
}

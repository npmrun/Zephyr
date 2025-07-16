import { BaseSingleton } from "base"

export class Tabs extends BaseSingleton {
  constructor() {
    super()
  }

  private isListen: boolean = false

  private execUpdate = (...args) => {
    this.#fnList.forEach(v => v(...args))
  }

  #fnList: ((...args) => void)[] = []
  listenUpdate(cb: (...args) => void) {
    if (!this.isListen) {
      api.on("main:TabsCommand.update", this.execUpdate)
      this.isListen = true
    }
    this.#fnList.push(cb)
  }

  unListenUpdate(fn: (...args) => void) {
    this.#fnList = this.#fnList.filter(v => {
      return v !== fn
    })
    if (!this.#fnList.length) {
      api.off("main:TabsCommand.update", this.execUpdate)
      this.isListen = false
    }
  }

  bindPosition(data) {
    api.call("TabsCommand.bindElement", data)
  }

  closeAll() {
    api.call("TabsCommand.closeAll")
  }

  sync() {
    api.call("TabsCommand.sync")
  }

  unListenerAll() {
    this.#fnList = []
    api.offAll("main:TabsCommand.update")
  }

  async getAllTabs() {
    const res = await api.call("TabsCommand.getAllTabs")
    return res
  }
}

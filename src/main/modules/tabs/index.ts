import Tab from "./Tab"
import BaseClass from "vc/base/base"
import _debug from "debug"
import { BrowserWindow } from "electron"
import EventEmitter from "events"

const debug = _debug("app:tabs")

class Tabs extends BaseClass {
    destroy() {
        this._tabs.forEach(v => v.destroy())
        this._tabs = []
    }

    public events = new EventEmitter()

    constructor() {
        super()
    }

    _tabs: Tab[] = []

    init(mainWindow) {
        this.add("about:blank", true, mainWindow)
    }

    add(url: string, active: boolean, win: BrowserWindow) {
        const tab = new Tab({ url }, win)
        tab.events.on("window-open", ev => {
            debug(ev)
            this.add(ev.url, true, win)
            this.events.emit("update")
            // tab.navigate(ev.url)
        })
        tab.events.on("update", () => {
            this.events.emit("update")
        })
        this._tabs.push(tab)
        if (active) {
            this.changeActive(this._tabs.length - 1)
        }
        this.events.emit("update")
    }

    changeActive(index: number) {
        this._tabs.forEach((tab, i) => {
            tab.setActive(i === index)
        })
        this.events.emit("update", index)
    }

    openDevtool(index: number) {
        if (this._tabs[index]) {
            this._tabs[index].openDevtool()
        }
    }

    reload(index: number) {
        if (this._tabs[index]) {
            this._tabs[index].reload()
        }
    }

    navigate(index: number, url: string) {
        if (this._tabs[index]) {
            this._tabs[index].navigate(url)
        }
    }

    remove(index: number) {
        this._tabs[index].destroy()
        if (this._tabs[index].isActive && index - 1 >= 0) {
            this.changeActive(index - 1)
        }
        this._tabs.splice(index, 1)
        this.events.emit("update")
    }

    removeAll(index: number[]) {
        index
            .map(v => {
                return this._tabs[+v]
            })
            .forEach(tab => {
                tab.destroy()
            })
        this._tabs = this._tabs.filter(v => {
            return !v.isDestory
        })
        this.events.emit("update")
    }
}

export { Tabs }
export default Tabs

import Tab from "./Tab"
import BaseClass from "vc/base/base"
import _debug from "debug"
import { BrowserWindow } from "electron"
import EventEmitter from "events"
import { inject, injectable } from "inversify"
import { WindowManager } from "../window-manager"

interface IRect {
    x: number
    y: number
    width: number
    height: number
}

const debug = _debug("app:tabs")

@injectable()
export class Tabs extends BaseClass {
    constructor(
        @inject(WindowManager) private _WindowManager: WindowManager
    ) {
        super()
    }

    destroy() {
        this._tabs.forEach(v => v.destroy())
        this._tabs = []
    }

    public events = new EventEmitter()

    private curRect: {
        x: number
        y: number
        width: number
        height: number
    } | null = null

    _tabs: Tab[] = []

    init(mainWindow) {
        this.add("about:blank", true, mainWindow)
    }

    updateRect(curRect: IRect) {
        this.curRect = curRect
        this._tabs.forEach(tab => {
            tab.updateRect(curRect)
        })
    }

    add(url: string, active: boolean, win: BrowserWindow) {
        if (!this.curRect) throw new Error("请绑定区域显示")
        const tab = new Tab({ url }, win, this.curRect)
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

    getCurrentTab(): Electron.WebContents | null {
        const activeTab = this._tabs.find(tab => tab.isActive)
        return activeTab?.webContentsView.webContents || null
    }

    getAllTabs(): Electron.WebContents[] {
        return this._tabs.map(tab => tab.webContentsView.webContents)
    }

    createTab(url: string) {
        this.add(url, true, this._WindowManager.getMainWindow())
        this.events.emit('created', this.getCurrentTab())
    }
}

export default Tabs

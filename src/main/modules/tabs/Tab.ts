import { BrowserWindow, WebContentsView, WebPreferences } from "electron"
import { join } from "node:path"
import BaseClass from "main/base/base"
import _debug from "debug"
// import { Layout } from "./Constant"
import FuckHTML from "@res/fuck.html?asset"
import { fileURLToPath, pathToFileURL } from "node:url"
import EventEmitter from "node:events"

const debug = _debug("tab")

interface IOption {
  url: string
  active: boolean
}

interface IRect {
  x: number
  y: number
  width: number
  height: number
}

class Tab extends BaseClass {
  init() {
    // TODO
  }
  public events = new EventEmitter()
  public url: string = ""
  public showUrl: string = ""
  public title: string = ""
  public favicons: string[] = []
  public active: boolean = false
  public alive: boolean = false
  public isDestory: boolean = false
  public playing: boolean = false
  public visible: boolean = false
  private webContentsView: WebContentsView | null = null
  private curWindow: BrowserWindow | null = null
  private curRect:
    | {
        x: number
        y: number
        width: number
        height: number
      }
    | undefined = undefined

  private defaultOptions: IOption = {
    url: "",
    active: false,
  }

  private options: IOption

  get isActive() {
    return this.active
  }

  constructor(options = {}, window: BrowserWindow, curRect?: IRect) {
    super()
    this.listenResize = this.listenResize.bind(this)
    this.options = {
      ...this.defaultOptions,
      ...options,
    }
    this.url = this.getUrl(this.options.url)
    this.showUrl = this.options.url
    this.curWindow = window
    this.curRect = curRect
    this.setActive(this.options.active)
  }
  destroyTimer: NodeJS.Timeout | null = null
  stopDestroyTimer() {
    if (this.destroyTimer !== null) {
      clearTimeout(this.destroyTimer)
      this.destroyTimer = null
    }
  }
  startDestroyTimer() {
    this.stopDestroyTimer()
    if (this.visible) return
    if (this.playing) return
    this.destroyTimer = setTimeout(() => {
      if (this.webContentsView && !this.webContentsView.webContents.isDestroyed()) {
        this.curWindow?.contentView.removeChildView(this.webContentsView!)
        // @ts-ignore 超过8s没有激活的tab就销毁
        this.webContentsView.webContents.destroy()
        this.webContentsView = null
        this.alive = false
        this.events.emit("update")
      }
    }, 8000)
  }

  setActive(active: boolean) {
    if (!active) {
      if (!this.webContentsView) return
      this.curWindow!.removeListener("resize", this.listenResize)
      this.webContentsView.setVisible(false)
      this.visible = false
      this.startDestroyTimer()
    } else {
      this.stopDestroyTimer()
      this.visible = true
      if (!this.webContentsView) {
        this.create()
        // , this.curWindow!.contentView.children.length - 1
        this.curWindow!.contentView.addChildView(this.webContentsView!)
        this.alive = true
        this.events.emit("update")
      }
      this.listenResize()
      this.curWindow!.addListener("resize", this.listenResize)
      this.webContentsView!.setVisible(true)
    }
    this.active = active
  }

  openDevtool() {
    if (!this.webContentsView) return
    this.webContentsView.webContents.openDevTools({
      mode: "right",
    })
  }

  reload() {
    if (!this.webContentsView) return
    this.webContentsView.webContents.reload()
  }

  create() {
    let securityAttr: Partial<WebPreferences> = {}
    if (this.url.startsWith("file:")) {
      // 预加载脚本
      securityAttr = {
        preload: join(__dirname, "../preload/index.mjs"),
        sandbox: false,
      }
    }
    this.webContentsView = new WebContentsView({
      webPreferences: {
        sandbox: true,
        webSecurity: true,
        allowRunningInsecureContent: false,
        nodeIntegration: false,
        spellcheck: false,
        contextIsolation: true,
        ...securityAttr,
      },
    })
    const webContents = this.webContentsView.webContents
    this.webContentsView.webContents.loadURL(this.url)
    // this.webContentsView.webContents.executeJavaScript(`
    //     const click = (x,y)=>{
    //         const ev = new MouseEvent("click", {
    //             view: window,
    //             bubbles: true,
    //             cancelable: true,
    //             screenX: x,
    //             screenY: y
    //         })

    //         const el = document.elementFromPoint(x,y);
    //         console.log(el)
    //         el.dispatchEvent(ev);
    //     }
    //     console.log("点击初始化完成")
    // `)
    this.webContentsView.webContents.setWindowOpenHandler(ev => {
      debug(ev)
      this.events.emit("window-open", ev)
      return { action: "deny" }
    })
    webContents.addListener("media-paused", () => {
      this.playing = false
      this.startDestroyTimer()
    })
    webContents.addListener("media-started-playing", () => {
      this.playing = true
      this.stopDestroyTimer()
    })
    webContents.addListener("did-finish-load", () => {
      this.url = webContents.getURL()
      this.showUrl = this.getShowUrl(this.url)
      this.events.emit("update")
    })
    webContents.addListener("did-navigate-in-page", () => {
      this.url = webContents.getURL()
      this.showUrl = this.getShowUrl(this.url)
      this.events.emit("update")
    })
    webContents.addListener("page-title-updated", (_, title) => {
      this.title = title
      debug(`tab页更新：`, title)
      this.events.emit("update")
    })
    webContents.addListener("page-favicon-updated", (_, favicons) => {
      this.favicons = favicons
      debug(favicons)
      this.events.emit("update")
    })
    // 待机的销毁，但不去除实例
    webContents.addListener("destroyed", () => {
      this.#destoryWebContentsView()
    })
  }

  print() {
    return {
      url: this.url,
      showUrl: this.showUrl,
    }
  }

  private getUrl(url) {
    if (url === "about:blank") {
      debug(FuckHTML)
      return pathToFileURL(FuckHTML).href
    }
    return url
  }

  private getShowUrl(url) {
    try {
      if (fileURLToPath(url) === FuckHTML) {
        debug(url)
        debug(FuckHTML)
        return "about:blank"
      }
    } catch (error) {
      // ignore
    }
    return url
  }

  listenResize() {
    if (!this.curWindow) {
      return
    }
    if (!this.webContentsView) {
      return
    }
    if (!this.curRect) {
      return
    }
    this.webContentsView.setBounds(this.curRect)
    // const size = this.curWindow.getContentSize()
    // this.webContentsView.setBounds(Layout(size[0], size[1]))
  }

  updateRect(curRect: IRect) {
    this.curRect = curRect
    if (!this.webContentsView) {
      return
    }
    this.webContentsView.setBounds(this.curRect)
  }

  navigate(url: string) {
    if (!this.webContentsView) return
    this.webContentsView.webContents.loadURL(this.getUrl(url))
  }

  #destoryWebContentsView() {
    this.stopDestroyTimer()
    if (this.webContentsView && this.curWindow && !this.curWindow.isDestroyed()) {
      this.curWindow.contentView.removeChildView(this.webContentsView)
      this.curWindow.removeListener("resize", this.listenResize)
    }
    if (this.webContentsView && !this.webContentsView.webContents.isDestroyed()) {
      this.webContentsView.webContents.removeAllListeners()
      this.webContentsView.removeAllListeners()
      // @ts-ignore 超过8s没有激活的tab就销毁
      this.webContentsView.webContents.destroy()
    }
    this.webContentsView = null
  }

  destroy() {
    this.#destoryWebContentsView()
    this.events.removeAllListeners()
    this.isDestory = true
    debug("Tab destroy")
  }
}

export { Tab }
export default Tab

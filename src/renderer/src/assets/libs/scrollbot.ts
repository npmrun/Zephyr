interface ScrollStyle {
  [key: string]: string
}

class Scrollbot {
  private orgPar!: HTMLElement
  private sbw: number = 5
  private scrollSpeed: number = 200
  private parContent!: string
  private newPar!: HTMLDivElement
  // private sbContainer!: HTMLDivElement
  private scrollBarHolder!: HTMLDivElement
  private scrollBar!: HTMLDivElement
  private inP!: HTMLDivElement
  private sbHeight: number = 0
  private mdown: boolean = false
  private customHeight: boolean = false
  // private scrollElement!: HTMLElement
  private onScrollF?: () => void
  private sB: ScrollStyle = {}
  private sBH: ScrollStyle = {}
  private posCorrection: number = 0
  private btmCorrection: number = 0
  private relY: number = 0
  private pC: number = 0

  getDom(selector: string | HTMLElement) {
    if (typeof selector === "string") {
      return document.querySelector<HTMLElement>(selector)
    }
    return selector
  }

  constructor(selector: string | HTMLElement, width?: number) {
    const element = this.getDom(selector)
    if (!element) throw new Error("Element not found")
    this.orgPar = element

    const ieVersion = this.isIE()
    if (!ieVersion || (ieVersion && ieVersion < 9)) {
      this.init(width)
    }
  }

  private init(width?: number): void {
    this.sbw = width ?? 5
    this.parContent = this.orgPar.innerHTML
    this.orgPar.innerHTML = ""

    this.setupElements()
    this.setupStyles()
    this.setupEventListeners()
    this.refresh()
  }

  private setupElements(): void {
    this.newPar = document.createElement("div")
    // this.sbContainer = document.createElement("div")
    this.scrollBarHolder = document.createElement("div")
    this.scrollBar = document.createElement("div")
    this.inP = document.createElement("div")

    this.newPar.className = "scrollbot-outer-parent"
    this.scrollBarHolder.className = "scrollbot-scrollbar-holder"
    this.scrollBar.className = "scrollbot-scrollbar"
    this.inP.className = "scrollbot-inner-parent"

    this.inP.innerHTML = this.parContent
    this.newPar.appendChild(this.inP)
    this.scrollBarHolder.appendChild(this.scrollBar)
    this.newPar.appendChild(this.scrollBarHolder)
    this.orgPar.appendChild(this.newPar)
  }

  private setupStyles(): void {
    this.newPar.style.position = "relative"
    this.newPar.style.paddingRight = `${this.sbw}px`
    this.newPar.style.zIndex = "9999999"
    this.newPar.style.height = "100%"
    this.newPar.style.overflow = "hidden"

    this.inP.style.cssText = `height:100%;overflow-y:auto;overflow-x:hidden;padding-right:${
      this.sbw + 20
    }px;width:100%;box-sizing:content-box;`

    this.sbHeight = (this.inP.clientHeight * 100) / this.inP.scrollHeight
    // this.scrollElement = this.inP

    this.updateScrollbarStyles()
  }

  private updateScrollbarStyles(): void {
    this.sB = {
      width: `${this.sbw}px`,
      height: `${this.sbHeight}%`,
      position: "absolute",
      right: "0",
      top: "0",
      backgroundColor: "#444444",
      borderRadius: "15px",
    }

    this.sBH = {
      width: `${this.sbw}px`,
      height: "100%",
      position: "absolute",
      right: "0",
      top: "0",
      backgroundColor: "#ADADAD",
      borderRadius: "15px",
    }

    Object.assign(this.scrollBar.style, this.sB)
    Object.assign(this.scrollBarHolder.style, this.sBH)
  }

  public refresh(): void {
    this.sbHeight = (this.inP.clientHeight * 100) / this.inP.scrollHeight
    this.scrollBarHolder.style.display = this.sbHeight >= 100 ? "none" : "block"

    if (this.inP.scrollHeight > this.inP.clientHeight) {
      this.scrollBar.style.height = this.customHeight ? this.sB.height : `${this.sbHeight}%`
    }
  }

  public destroy(): void {
    this.orgPar.innerHTML = this.parContent
    this.orgPar.style.overflow = "auto"
  }

  private isIE(): number | false {
    const userAgent = navigator.userAgent.toLowerCase()
    const msie = userAgent.indexOf("msie")
    return msie !== -1 ? parseInt(userAgent.split("msie")[1]) : false
  }

  public onScroll(callback: () => void): void {
    this.onScrollF = callback
  }

  private setupEventListeners(): void {
    this.setupScrollListener()
    this.setupMouseEvents()
  }

  private setupScrollListener(): void {
    this.inP.addEventListener("scroll", () => {
      const scrollPercentage = (this.inP.scrollTop * 100) / this.inP.scrollHeight
      const correction =
        ((this.sbHeight - parseFloat(this.sB.height)) * this.inP.scrollTop) / (this.inP.scrollHeight - this.inP.clientHeight)

      this.scrollBar.style.top = `${scrollPercentage + correction}%`

      if (this.onScrollF) {
        this.onScrollF()
      }
    })
  }

  private setScroll(position: number, duration: number = 500): void {
    if (position >= this.inP.scrollHeight - this.inP.clientHeight) {
      position = this.inP.scrollHeight - this.inP.clientHeight
    }

    const difference = position - this.inP.scrollTop
    const perTick = (difference / duration) * 10

    setTimeout(() => {
      this.inP.scrollTop += perTick
      if (Math.abs(position - this.inP.scrollTop) < 5) return
      this.setScroll(position, duration - 10)
    }, 10)
  }

  private setupMouseEvents(): void {
    // 滚动条容器点击事件
    this.scrollBarHolder.onmousedown = (e: MouseEvent) => {
      if (e.target !== this.scrollBarHolder) return
      const relPos = ((e.pageY - this.scrollBarHolder.getBoundingClientRect().top) * 100) / this.scrollBarHolder.clientHeight
      this.setScroll((this.inP.scrollHeight * relPos) / 100, this.scrollSpeed)
    }

    // 滚动条拖动事件
    this.scrollBar.onmousedown = (e: MouseEvent) => {
      this.mdown = true
      this.posCorrection = e.pageY - this.scrollBar.getBoundingClientRect().top
      this.btmCorrection = (this.scrollBar.clientHeight * 100) / this.newPar.clientHeight
      return false
    }

    // 全局鼠标事件
    document.onmouseup = () => {
      this.mdown = false
    }

    document.onmousemove = (e: MouseEvent) => {
      if (this.mdown) {
        // 清除文本选择
        window.getSelection()?.removeAllRanges()

        this.relY = e.pageY - this.newPar.getBoundingClientRect().top
        this.pC = ((this.relY - this.posCorrection) * 100) / this.newPar.clientHeight

        if (this.pC >= 0 && this.pC + this.btmCorrection <= 100) {
          this.scrollBar.style.top = `${this.pC}%`
          this.inP.scrollTop =
            ((parseFloat(this.scrollBar.style.top) -
              ((this.sbHeight - parseFloat(this.sB.height)) * this.inP.scrollTop) / (this.inP.scrollHeight - this.inP.clientHeight)) *
              this.inP.scrollHeight) /
            100
        } else if (this.pC < 0 && parseFloat(this.scrollBar.style.top) > 0) {
          this.scrollBar.style.top = "0%"
          this.inP.scrollTop = 0
        }

        if (this.onScrollF) {
          this.onScrollF()
        }
      }
      return false
    }
  }

  public setStyle(scrollbar?: ScrollStyle, scrollbarHolder?: ScrollStyle): Scrollbot {
    if (scrollbar) {
      scrollbar.width = `${this.sbw}px`
      if ("height" in scrollbar) {
        this.customHeight = true
        scrollbar.height = `${(parseFloat(scrollbar.height) * 100) / this.newPar.clientHeight}%`
      }
      Object.assign(this.sB, scrollbar)
      Object.assign(this.scrollBar.style, scrollbar)
    }

    if (scrollbarHolder) {
      scrollbarHolder.width = `${this.sbw}px`
      Object.assign(this.sBH, scrollbarHolder)
      Object.assign(this.scrollBarHolder.style, scrollbarHolder)
    }

    return this
  }
}

export default Scrollbot

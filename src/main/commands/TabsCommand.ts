import { inject } from "inversify"
import Tabs from "vc/modules/tabs"
import WindowManager from "vc/modules/window-manager"
import { broadcast } from "vc/utils"

class TabsCommand {
    static name: string = "TabsCommand"

    constructor(
        @inject(Tabs) private _Tabs: Tabs,
        @inject(WindowManager) private _WindowManager: WindowManager,
    ) {
        this.listenerTabActive = this.listenerTabActive.bind(this)
        this._Tabs.events.addListener("update", this.listenerTabActive)
    }

    reload() {
        this._WindowManager.getMainWindow()?.reload()
    }

    sync() {
        this.listenerTabActive()
    }

    listenerTabActive() {
        broadcast("TabsCommand.update", this.getAllTabs())
    }

    add(url) {
        this._Tabs.add(url, true, this._WindowManager.getMainWindow()!)
    }

    nagivate(index: number, url: string) {
        console.log(`跳转${index}:${url}`)

        this._Tabs.navigate(+index, url)
    }

    setActive(index) {
        this._Tabs.changeActive(index)
    }

    closeTab(e) {
        this._Tabs.remove(e.body.active)
    }

    getAllTabs() {
        return this._Tabs._tabs.map(v => ({
            url: v.url,
            showUrl: v.showUrl,
            title: v.title,
            favicons: v.favicons,
            isActive: v.isActive,
        }))
    }
}

export { TabsCommand }
export default TabsCommand

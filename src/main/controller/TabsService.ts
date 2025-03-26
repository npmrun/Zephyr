import { inject, injectable } from "inversify"
import BaseContainer from "main/base/baseContainer"
import Tabs from "main/modules/tabs"
import WindowManager from "main/modules/window-manager"

@injectable()
class TabsService extends BaseContainer {
  constructor(
    @inject(Tabs) private _Tabs: Tabs,
    @inject(WindowManager) private _WindowManager: WindowManager,
  ) {
    super()
  }

  add(e) {
    this._Tabs.add(e.body.url, true, this._WindowManager.getMainWindow()!)
  }

  setActive(e) {
    this._Tabs.changeActive(e.body.active)
  }

  closeTab(e) {
    this._Tabs.remove(e.body.active)
  }

  closeTabAll(e) {
    this._Tabs.removeAll(e.body.active)
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

export { TabsService }
export default TabsService

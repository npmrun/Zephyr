import { inject, injectable } from "inversify"
import BaseContainer from "main/base/baseContainer"
// import Tabs from "main/modules/tabs"
import WindowManager from "main/modules/window-manager"

@injectable()
class BasicService extends BaseContainer {
  static name = "Basic"
  constructor(
    @inject(WindowManager) private _WindowManager: WindowManager,
    // @inject(Tabs) private _Tabs: Tabs,
  ) {
    super()
  }

  showAbout() {
    this._WindowManager.showWindow("about")
    return {
      a: "fuck",
    }
  }

  openTabDevtool() {
    // this._Tabs.reload(0)
    // this._Tabs.openDevtool(0)
  }
}

export { BasicService }
export default BasicService

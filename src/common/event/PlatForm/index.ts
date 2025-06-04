import { ApiFactory } from "common/lib/abstract"
import { BaseSingleton } from "base"
import { LogLevel } from "packages/logger/common"

class PlatForm extends BaseSingleton {
  constructor() {
    super()
  }

  private get api() {
    return ApiFactory.getApiClient()
  }

  async logSetLevel(level: LogLevel) {
    return this.api.call("PlatFormCommand.logSetLevel", level)
  }

  async logGetLevel() {
    return this.api.call("PlatFormCommand.logGetLevel")
  }

  async showAbout() {
    // return this.api.call("BasicService.showAbout")
    return this.api.call("PlatFormCommand.showAbout")
  }

  async showSrd() {
    // return this.api.call("BasicService.showAbout")
    return this.api.call("PlatFormCommand.showSrd")
  }

  async getSrdCookie() {
    // return this.api.call("BasicService.showAbout")
    return this.api.call("PlatFormCommand.getSrdCookie")
  }

  async crash() {
    return this.api.call("PlatFormCommand.crash")
  }

  async isFullScreen() {
    return this.api.call("PlatFormCommand.isFullscreen")
  }

  async toggleFullScreen() {
    return this.api.call("PlatFormCommand.fullscreen")
  }

  async reload() {
    return this.api.call("PlatFormCommand.reload")
  }

  async toggleDevTools() {
    return this.api.call("PlatFormCommand.toggleDevTools")
  }
}

export { PlatForm }

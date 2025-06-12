import { ApiFactory } from "common/lib/abstract"
import { BaseSingleton } from "base"
import { IConfig } from "config"

class Setting extends BaseSingleton {
  constructor() {
    super()
  }

  private get api() {
    return ApiFactory.getApiClient()
  }

  sync() {
    return this.api.callSync("SettingCommand.sync")
  }

  save(config: IConfig) {
    return this.api.call("SettingCommand.save", config)
  }
}

export { Setting }

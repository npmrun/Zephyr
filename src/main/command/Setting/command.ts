import Setting, { IConfig } from "setting/main"
import { broadcast } from "utils/main"

export default class SettingCommand {
  static init() {
    Setting.events.on("change", (k, value) => {
      console.log(k, value)
      broadcast("SettingCommand.change", k, value)
    })
  }
  sync() {
    return Setting.config()
  }
  save(config: IConfig) {
    return Setting.set(config)
  }
}

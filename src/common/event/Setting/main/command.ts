import Setting, { IConfig } from "setting/main"

export default class SettingCommand {
  static init() {
    console.log("SettingCommand init")
  }
  sync() {
    return Setting.config()
  }
  save(config: IConfig) {
    return Setting.set(config)
  }
}

import Updater from "helper/updater/main"
import _logger from "logger/main"
import { broadcast } from "utils/main"

const logger = _logger.createNamespace("UpdaterCommand")

export default class UpdaterCommand {
  static init() {
    // 命令初始化
    logger.debug("UpdaterCommand init")
    Updater.events.on("*", (name, ...argus) => {
      broadcast(name, ...argus)
    })
  }

  async triggerHotUpdate() {
    Updater.triggerHotUpdate()
  }

  checkForUpdates() {
    return Updater.checkForUpdates()
  }
}

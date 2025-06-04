import Updater from "helper/updater/main"
import _logger from "logger/main"

const logger = _logger.createNamespace("UpdaterCommand")

export default class UpdaterCommand {
  static init() {
    // 命令初始化
    logger.debug("UpdaterCommand init")
  }

  async triggerHotUpdate() {
    Updater.triggerHotUpdate()
  }
}

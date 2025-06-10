import pkg from "electron-updater"
import { app, dialog } from "electron"
import Setting from "setting/main"
import { BaseSingleton } from "base"
import { fetchHotUpdatePackage, flagNeedUpdate } from "./hot"
import Locales from "locales/main"
import _logger from "logger/main"
import { buildEmitter } from "base/event/main"

const logger = _logger.createNamespace("updater")
const { autoUpdater } = pkg

class _Updater extends BaseSingleton {
  public events = buildEmitter()
  private timer: ReturnType<typeof setInterval> | null = null
  // autoReplace = false
  async triggerHotUpdate(autoReplace = false) {
    const url = Setting.values("update.hoturl")
    await fetchHotUpdatePackage(url)
    flagNeedUpdate()
    if (!autoReplace) {
      dialog.showMessageBox({
        title: Locales.t("update.ready.hot.title"),
        message: Locales.t("update.ready.hot.desc", { version: app.getVersion() }),
      })
    } else {
      app.quit()
    }
  }

  constructor() {
    super()
    // 配置自动更新
    autoUpdater.autoDownload = false
    autoUpdater.autoInstallOnAppQuit = true

    // 检查更新错误
    autoUpdater.on("error", error => {
      logger.debug("Update error:", error)
    })

    // 检查更新
    autoUpdater.on("checking-for-update", () => {
      logger.debug("Checking for updates...")
    })

    // 有可用更新
    autoUpdater.on("update-available", info => {
      logger.debug("Update available:", info)
      this.promptUserToUpdate()
    })

    // 没有可用更新
    autoUpdater.on("update-not-available", info => {
      logger.debug("Update not available:", info)
    })

    // 更新下载进度
    autoUpdater.on("download-progress", progressObj => {
      logger.debug(
        `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`,
      )
    })

    // 更新下载完成
    autoUpdater.on("update-downloaded", info => {
      logger.debug("Update downloaded:", info)
      this.promptUserToInstall()
    })
  }

  init() {
    // 定期检查更新
    this.checkForUpdates()
    this.timer && clearInterval(this.timer)
    this.timer = setInterval(
      () => {
        this.checkForUpdates()
      },
      1000 * 60 * 60,
    ) // 每小时检查一次
  }

  destroy() {
    // 清理工作
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  private async checkForUpdates() {
    if (app.isPackaged) {
      try {
        await autoUpdater.checkForUpdates()
        logger.debug("Updater初始化检查成功.")
      } catch (error) {
        logger.debug("Failed to check for updates:", error)
      }
    } else {
      logger.debug("正在开发模式，跳过更新检查.")
    }
  }

  private async promptUserToUpdate() {
    const result = await dialog.showMessageBox({
      type: "info",
      title: "发现新版本",
      message: "是否下载新版本？",
      buttons: ["下载", "暂不更新"],
      defaultId: 0,
    })

    if (result.response === 0) {
      autoUpdater.downloadUpdate()
    }
  }

  private async promptUserToInstall() {
    const result = await dialog.showMessageBox({
      type: "info",
      title: "更新已就绪",
      message: "新版本已下载完成，是否立即安装？",
      buttons: ["立即安装", "稍后安装"],
      defaultId: 0,
    })

    if (result.response === 0) {
      autoUpdater.quitAndInstall(false, true)
    }
  }
}

const Updater = _Updater.getInstance()

export { Updater }
export default Updater

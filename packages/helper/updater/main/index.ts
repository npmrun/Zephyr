import { NsisUpdater } from "electron-updater"
import { app, BrowserWindow, dialog } from "electron"
import { is } from "@electron-toolkit/utils"
import Setting from "setting/main"
import { BaseSingleton } from "base"
import { fetchHotUpdatePackage, flagNeedUpdate } from "./hot"
import Locales from "locales/main"
import _logger from "logger/main"
import { buildEmitter } from "base/event/main"
import { EventMaps } from "../common"
import path from "path"

const logger = _logger.createNamespace("updater")

class _Updater extends BaseSingleton {
  public events = buildEmitter<EventMaps>()
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

  updateInfo: ConstructorParameters<typeof NsisUpdater>[0]
  autoUpdater: NsisUpdater

  constructor() {
    super()

    this.autoUpdater = new NsisUpdater({
      provider: "github",
      owner: "npmrun",
      repo: "electron-app",
    })

    Setting.onChange("update.allowDowngrade", () => {
      this.autoUpdater.allowDowngrade = Setting.values("update.allowDowngrade")
    })
    Setting.onChange("update.allowPrerelease", () => {
      this.autoUpdater.allowPrerelease = Setting.values("update.allowPrerelease")
    })
    Setting.onChange(["update.owner", "update.repo"], () => {
      this.autoUpdater.setFeedURL({
        provider: "github",
        owner: "npmrun",
        repo: "electron-app",
      })
    })

    // 配置自动更新
    this.autoUpdater.autoDownload = false
    this.autoUpdater.autoInstallOnAppQuit = true

    this.autoUpdater.allowPrerelease = true
    this.autoUpdater.allowDowngrade = true
    this.autoUpdater.forceDevUpdateConfig = is.dev
    if (is.dev) {
      this.autoUpdater.updateConfigPath = path.resolve(process.cwd(), "temp/dev.yml")
    }

    // 检查更新错误
    this.autoUpdater.on("error", error => {
      logger.debug("Update error:", error)
      this.events.emit("error", error)
    })

    // 检查更新
    this.autoUpdater.on("checking-for-update", () => {
      logger.debug("Checking for updates...")
      this.events.emit("checking-for-update")
    })

    // 有可用更新
    this.autoUpdater.on("update-available", info => {
      logger.debug("Update available:", info)
      this.events.emit("update-available", info)
      this.promptUserToUpdate(info.releaseNotes)
    })

    // 没有可用更新
    this.autoUpdater.on("update-not-available", info => {
      logger.debug("Update not available:", info)
      this.events.emit("update-not-available", info)
    })

    // 更新下载进度
    this.autoUpdater.on("download-progress", progressObj => {
      logger.debug(
        `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`,
      )
      this.events.emit("update-progress", {
        speed: progressObj.bytesPerSecond,
        percent: progressObj.percent,
        all: progressObj.total,
        now: progressObj.transferred,
      })
    })

    // 更新下载完成
    this.autoUpdater.on("update-downloaded", info => {
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

  async checkForUpdates() {
    try {
      logger.debug("Update开始检查更新.")
      await this.autoUpdater.checkForUpdates()
    } catch (error) {
      logger.debug("Failed to check for updates:", error)
    }
  }

  private async promptUserToUpdate(releaseNotes) {
    const result = await dialog.showMessageBox({
      type: "info",
      title: "发现新版本",
      message: releaseNotes, // "是否下载新版本？",
      buttons: ["下载", "暂不更新"],
      defaultId: 0,
    })

    if (result.response === 0) {
      this.autoUpdater.downloadUpdate()
    }
  }

  private async promptUserToInstall() {
    const result = await dialog.showMessageBox(BrowserWindow.getFocusedWindow()!, {
      type: "info",
      title: "更新已就绪",
      message: "新版本已下载完成，是否立即安装？",
      buttons: ["立即安装"],
      defaultId: 0,
    })

    if (result.response === 0) {
      this.autoUpdater.quitAndInstall(false, true)
    }
  }
}

const Updater = _Updater.getInstance()

export { Updater }
export default Updater

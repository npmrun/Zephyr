import pkg from "electron-updater"
import { app, dialog } from "electron"
import { injectable } from "inversify"
import BaseClass from "main/base/base"
// import { Setting } from "../setting"
import _debug from "debug"
import EventEmitter from "events"

const debug = _debug("app:updater")
const { autoUpdater } = pkg

@injectable()
export class Updater extends BaseClass {
    public events = new EventEmitter()

    constructor(
        // @inject(Setting) private _Setting: Setting
    ) {
        super()

        // 配置自动更新
        autoUpdater.autoDownload = false
        autoUpdater.autoInstallOnAppQuit = true

        // 检查更新错误
        autoUpdater.on("error", error => {
            debug("Update error:", error)
        })

        // 检查更新
        autoUpdater.on("checking-for-update", () => {
            debug("Checking for updates...")
        })

        // 有可用更新
        autoUpdater.on("update-available", info => {
            debug("Update available:", info)
            this.promptUserToUpdate()
        })

        // 没有可用更新
        autoUpdater.on("update-not-available", info => {
            debug("Update not available:", info)
        })

        // 更新下载进度
        autoUpdater.on("download-progress", progressObj => {
            debug(
                `Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`,
            )
        })

        // 更新下载完成
        autoUpdater.on("update-downloaded", info => {
            debug("Update downloaded:", info)
            this.promptUserToInstall()
        })
    }

    init() {
        // 定期检查更新
        this.checkForUpdates()
        setInterval(
            () => {
                this.checkForUpdates()
            },
            1000 * 60 * 60,
        ) // 每小时检查一次
    }

    destroy() {
        // 清理工作
    }

    private async checkForUpdates() {
        if (app.isPackaged) {
            try {
                await autoUpdater.checkForUpdates()
            } catch (error) {
                debug("Failed to check for updates:", error)
            }
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

export default Updater

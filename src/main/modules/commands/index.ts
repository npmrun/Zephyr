import { IMenuItemOption, IPopupMenuOption } from "#/popup-menu"
import { ipcMain, Menu, MenuItem } from "electron"
import { inject } from "inversify"
import IOC from "main/_ioc"
import BaseClass from "main/base/base"
import { isPromise } from "main/utils"
import WindowManager from "../window-manager"

export default class Commands extends BaseClass {
    destroy() {
        // TODO
    }

    constructor(
        @inject(IOC) private _IOC: IOC,
        @inject(WindowManager) private _WindowManager: WindowManager,
    ) {
        super()
    }

    private async handleCommand(command: string, ...argus) {
        const splitClass = command.split(".")
        const run = await this._IOC.getAsync<any>(splitClass[0])
        if (run) {
            const result: Promise<any> | any = run[splitClass[1]](...argus)
            return [true, result]
        }
        return [false]
    }

    public async invoke(command, ...argus) {
        const result = await this.handleCommand(command, ...argus)
        return result
    }

    init() {
        ipcMain.addListener("command", async (event, key, command: string, ...argus) => {
            // console.log(event.sender);
            try {
                const [isExist, result] = await this.handleCommand(command, ...argus)
                if (isExist) {
                    if (isPromise(result)) {
                        result
                            .then((res: any) => {
                                event.reply(key, null, res ?? null)
                                event.returnValue = res ?? null
                            })
                            .catch((err: Error) => {
                                event.reply(key, err)
                                event.returnValue = null
                            })
                    } else {
                        event.reply(key, null, result ?? null)
                        event.returnValue = result ?? null
                    }
                } else {
                    event.reply(key, new Error(`不存在该命令:${command}`))
                    event.returnValue = null
                }
            } catch (error) {
                event.reply(key, error)
                event.returnValue = null
            }
        })

        ipcMain.on("x_popup_menu", (_, name: string, options: IPopupMenuOption) => {
            const menu = new Menu()
            const readMenu = (items: IMenuItemOption[]) => {
                return items.map(opt => {
                    if (typeof opt._click_evt === "string") {
                        const evt: string = opt._click_evt
                        opt.click = () => {
                            // broadcast(evt)
                            this.sendMessage(name, evt)
                        }
                    }
                    if (opt.submenu && Array.isArray(opt.submenu)) {
                        opt.submenu = readMenu(opt.submenu)
                    }

                    return opt
                })
            }
            const arrays = readMenu(options.items)

            arrays.forEach(v => {
                const item = new MenuItem(v)
                menu.append(item)
            })

            menu.on("menu-will-close", () => {
                this.sendMessage(name, `popup_menu_close:${options.menu_id}`)
                // broadcast(`popup_menu_close:${options.menu_id}`)
            })
            menu.popup(options.popupOptions)
        })
    }

    sendMessage(name: string, evt: string, ...argu: any[]) {
        const win = this._WindowManager.get(name)
        if (win) {
            win.webContents.send(evt, ...argu)
        }
    }
}

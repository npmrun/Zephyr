import { inject } from "inversify"
import Updater from "main/modules/updater"

export default class BasicCommand {
    constructor(@inject(Updater) private _Updater: Updater) {}

    async triggerHotUpdate() {
        await this._Updater.triggerHotUpdate()
    }
}

import { _Base } from "common/lib/_Base"
import { ApiFactory } from "common/lib/abstract"

class PlatForm extends _Base {
    constructor() {
        super()
    }

    private get api() {
        return ApiFactory.getApiClient()
    }

    async showAbout() {
        return this.api.call("BasicService.showAbout")
    }

    async isFullScreen() {
        return this.api.call("PlatFormCommand.isFullscreen")
    }

    async toggleFullScreen() {
        return this.api.call("PlatFormCommand.fullscreen")
    }

    async toggleDevTools() {
        return this.api.call("PlatFormCommand.toggleDevTools")
    }
}

export { PlatForm }

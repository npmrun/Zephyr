import { _Base } from "common/lib/_Base"

class PlatForm extends _Base {
    constructor() {
        super()
    }

    async showAbout() {
        return await fetch("api://fuck/BasicService/showAbout")
    }

    async isFullScreen() {
        return await api.call("BasicCommand.isFullscreen")
    }

    async toggleFullScreen() {
        return api.call("BasicCommand.fullscreen")
    }

    async toggleDevTools() {
        return api.call("BasicCommand.toggleDevTools")
    }
}

export { PlatForm }

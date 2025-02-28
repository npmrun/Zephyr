import { _Base } from "./_Base"

class PlatForm extends _Base {
    constructor() {
        super()
    }

    toggleFullScreen() {
        return api.call("BasicCommand.fullscreen")
    }

    toggleDevTools() {
        return api.call("BasicCommand.toggleDevTools")
    }
}

export { PlatForm }

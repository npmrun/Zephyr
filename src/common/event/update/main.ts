import { broadcast } from "main/utils"
import { AllKeys } from "../common"

function emitHotUpdateReady(...argu) {
    broadcast<AllKeys>("hot-update-ready", ...argu)
}

export { emitHotUpdateReady }

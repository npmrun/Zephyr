import { broadcast } from "main/utils"
import { AllKeys } from "common/event/common"

function emitHotUpdateReady(...argu) {
  broadcast<AllKeys>("hot-update-ready", ...argu)
}

export { emitHotUpdateReady }

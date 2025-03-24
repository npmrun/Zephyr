import { broadcast } from "main/utils"
import { AllKeys } from "../common"

function emitProgress(...argu) {
    broadcast<AllKeys>("progress", ...argu)
}

export { emitProgress }

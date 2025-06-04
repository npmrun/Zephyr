import { broadcast } from "main/utils"
import { EventEnum } from "../common"

export { EventEnum }

export function emit(key: EventEnum, ...args: any[]) {
  broadcast(key, ...args)
}

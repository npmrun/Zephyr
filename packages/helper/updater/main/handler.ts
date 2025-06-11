import { broadcast } from "utils/main"
import { EventMaps } from "../common"

export function emit(key: keyof EventMaps, ...args: Parameters<EventMaps[keyof EventMaps]>) {
  broadcast(key, ...args)
}

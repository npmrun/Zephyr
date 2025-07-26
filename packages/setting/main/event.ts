import { buildEmitter } from "base/event/main"
import { EventMaps } from "setting/common"

export const emitter = buildEmitter<EventMaps>()

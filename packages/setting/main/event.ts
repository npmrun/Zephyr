import { buildEmitter } from "base/event/main"
import type { IOnFunc } from "setting/main"

export const emitter = buildEmitter<{
  update: IOnFunc
}>()

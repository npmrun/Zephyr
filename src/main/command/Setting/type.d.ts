import type { EventMaps } from "setting/common"

export interface SettingCommand {
  save: () => void
  reset: () => void
}

export { EventMaps }

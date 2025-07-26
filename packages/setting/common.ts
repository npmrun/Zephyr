import type { IOnFunc } from "setting/main"

export type EventMaps = {
  init: IOnFunc
  update: IOnFunc
  change: (key: string, value: any) => void
}

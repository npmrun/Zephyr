import { UpdateInfo } from "electron-updater"

export interface UpdaterCommand {
  checkForUpdates: () => void
}

export type EventMaps = {
  "update-progress": (data: { speed: number; percent: number; all: number; now: number }) => void
  error: (err: any) => void
  "updater:error": (info: UpdateInfo) => void
  "checking-for-update": () => void
  "update-available": (info: UpdateInfo) => void
  "update-not-available": (info: UpdateInfo) => void
  "updater:downloaded": (p: any) => void
}

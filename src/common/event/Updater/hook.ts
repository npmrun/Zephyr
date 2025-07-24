import { EventMaps, UpdaterCommand } from "helper/updater/common"
import { defineStore } from "pinia"

export const enum UpdaterStatus {
  Idle = "idle",
  Checking = "checking",
  StartChecking = "start-checking",
  UpdateAvailable = "update-available",
  UpdateNotAvailable = "update-not-available",
  Downloading = "downloading",
  Error = "error",
}

export const useUpdaterStore = defineStore(
  "Updater",
  () => {
    const curStatus = ref(UpdaterStatus.Idle)
    const speed = ref(0)
    const percent = ref(0)
    const all = ref(0)
    const now = ref(0)

    const isNeedUpdate = ref(false)

    const api = getApi<UpdaterCommand, EventMaps, "UpdaterCommand">()
    api.on("error", (_, data) => {
      curStatus.value = UpdaterStatus.Error
      console.log(data)
    })
    api.on("update-not-available", () => {
      curStatus.value = UpdaterStatus.UpdateNotAvailable
      isNeedUpdate.value = false
    })
    api.on("update-available", () => {
      curStatus.value = UpdaterStatus.UpdateAvailable
      isNeedUpdate.value = true
    })
    api.on("update-progress", (_, data) => {
      curStatus.value = UpdaterStatus.Downloading
      speed.value = +(data.speed / 1000).toFixed(2) // Convert to KB/s
      percent.value = data.percent
      all.value = data.all
      now.value = data.now
      isNeedUpdate.value = false
    })
    api.on("checking-for-update", () => {
      curStatus.value = UpdaterStatus.Checking
    })
    if (import.meta.env.PROD) {
      api.callLong("UpdaterCommand.checkForUpdates")
    }
    return {
      status: curStatus,
      speed: speed,
      percent: percent,
      all: all,
      now: now,
      isNeedUpdate,
      checkForUpdates() {
        if (curStatus.value === UpdaterStatus.Checking) return
        if (curStatus.value === UpdaterStatus.Downloading) return
        curStatus.value = UpdaterStatus.StartChecking
        api.callLong("UpdaterCommand.checkForUpdates")
      },
    }
  },
  {
    persist: false,
  },
)

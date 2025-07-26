import { EventMaps, UpdaterCommand } from "helper/updater/common"
import { defineStore } from "pinia"

export const enum ApiUpdaterStatus {
  Idle = "idle",
  Checking = "checking",
  StartChecking = "start-checking",
  UpdateAvailable = "update-available",
  UpdateNotAvailable = "update-not-available",
  Downloading = "downloading",
  Error = "error",
}

export const useApiUpdater = defineStore(
  "Updater",
  () => {
    const curStatus = ref(ApiUpdaterStatus.Idle)
    const speed = ref(0)
    const percent = ref(0)
    const all = ref(0)
    const now = ref(0)

    const isNeedUpdate = ref(false)

    const api = getApi<UpdaterCommand, EventMaps, "UpdaterCommand">()
    api.on("UpdaterCommand.error", (_, data) => {
      curStatus.value = ApiUpdaterStatus.Error
      console.log(data)
    })
    api.on("UpdaterCommand.update-not-available", () => {
      curStatus.value = ApiUpdaterStatus.UpdateNotAvailable
      isNeedUpdate.value = false
    })
    api.on("UpdaterCommand.update-available", () => {
      curStatus.value = ApiUpdaterStatus.UpdateAvailable
      isNeedUpdate.value = true
    })
    api.on("UpdaterCommand.update-progress", (_, data) => {
      curStatus.value = ApiUpdaterStatus.Downloading
      speed.value = +(data.speed / 1000).toFixed(2) // Convert to KB/s
      percent.value = data.percent
      all.value = data.all
      now.value = data.now
      isNeedUpdate.value = false
    })
    api.on("UpdaterCommand.checking-for-update", () => {
      curStatus.value = ApiUpdaterStatus.Checking
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
        if (curStatus.value === ApiUpdaterStatus.Checking) return
        if (curStatus.value === ApiUpdaterStatus.Downloading) return
        curStatus.value = ApiUpdaterStatus.StartChecking
        api.callLong("UpdaterCommand.checkForUpdates")
      },
    }
  },
  {
    persist: false,
  },
)

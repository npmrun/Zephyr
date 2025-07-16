import { EventMaps, UpdaterCommand } from "helper/updater/common"
import { defineStore } from "pinia"

export const useUpdaterStore = defineStore(
  "Updater",
  () => {
    const isNeedUpdate = ref(false)
    const isChecking = ref(false)
    
    const api = getApi<UpdaterCommand, EventMaps, "UpdaterCommand">()
    api.on("error", (_, data) => {
      isChecking.value = false
      console.log(data)
    })
    api.on("update-not-available", (_, data) => {
      isChecking.value = false
      console.log(data)
    })
    api.on("update-available", (_, data) => {
      isChecking.value = false
      isNeedUpdate.value = true
      console.log(data)
    })
    api.on("update-progress", (_, data) => {
      console.log(data)
    })
    api.on("checking-for-update", () => {
      isChecking.value = true
    })
    api.call("UpdaterCommand.checkForUpdates")
    return {
      isChecking,
      isNeedUpdate,
      checkForUpdates() {
        if (isChecking.value) return
        api.call("UpdaterCommand.checkForUpdates")
      },
    }
  },
  {
    persist: false,
  },
)

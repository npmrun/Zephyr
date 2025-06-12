import { EventMaps } from "helper/updater/common"
import { defineStore } from "pinia"

export const useSettingStore = defineStore(
  "Updater",
  () => {
    getApi<EventMaps>().on("update-progress", (_, data) => {
      console.log(data)
    })

    return {}
  },
  {
    persist: false,
  },
)

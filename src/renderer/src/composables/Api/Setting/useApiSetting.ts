import { defineStore } from "pinia"
import { Setting } from "./_"
import type { IConfig } from "config"

let rawConfig: IConfig = Setting.getInstance().sync() as unknown as IConfig

export const useApiSetting = defineStore(
  "Setting",
  () => {
    const config = ref(JSON.parse(JSON.stringify(rawConfig)))
    const diffKeys = ref<(keyof IConfig)[]>([])
    const isSame = computed(() => {
      return diffKeys.value.length === 0
    })
    watch(
      () => config.value,
      () => {
        diffKeys.value = []
        ;(Object.keys(config.value) as (keyof IConfig)[]).forEach((key: keyof IConfig) => {
          if (config.value[key] !== rawConfig[key]) {
            diffKeys.value.push(key)
          }
        })
      },
      {
        deep: true,
        immediate: true,
      },
    )
    const reset = () => {
      const tempConfig = JSON.parse(JSON.stringify(rawConfig))
      config.value = tempConfig
    }
    const isSaving = ref(false)
    const save = async () => {
      if (isSaving.value) {
        return
      }
      isSaving.value = true
      try {
        const tempConfig = JSON.parse(JSON.stringify(unref(config)))
        await Setting.getInstance().save(tempConfig)
        isSaving.value = false
        rawConfig = JSON.parse(JSON.stringify(tempConfig))
        config.value = tempConfig
      } catch (error) {
        isSaving.value = false
        throw error
      }
    }
    return {
      config,
      isSame,
      isSaving,
      diffKeys,
      reset,
      save,
    }
  },
  {
    persist: false,
  },
)

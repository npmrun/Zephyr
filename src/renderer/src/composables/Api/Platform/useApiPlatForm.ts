import { LogLevel } from "logger/common"
import { PlatForm } from "./_"

export function useApiPlatForm() {
  const plat = PlatForm.getInstance<PlatForm>()

  // 全屏状态
  const isFullScreen = ref(false)
  ;(async () => {
    isFullScreen.value = await plat.isFullScreen()
  })()

  const toggleFullScreen = async () => {
    await plat.toggleFullScreen()
    isFullScreen.value = !isFullScreen.value
  }
  // 全屏状态 END

  const curLogLevel = ref<LogLevel>()
  ;(async () => {
    curLogLevel.value = await plat.logGetLevel()
  })()
  const isOpenDebug = computed(() => curLogLevel.value === LogLevel.TRACE)
  const toggleDebugMode = async () => {
    if (curLogLevel.value === LogLevel.TRACE) {
      await plat.logSetLevel(LogLevel.INFO)
      curLogLevel.value = LogLevel.INFO
      return
    }
    await plat.logSetLevel(LogLevel.TRACE)
    curLogLevel.value = LogLevel.TRACE
  }

  return {
    power: plat,
    isOpenDebug,
    toggleDebugMode,
    toggleFullScreen,
    isFullScreen,
  }
}

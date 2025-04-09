<template>
  <div
    relative
    h="30px"
    leading="29px"
    pr="137px"
    :style="{ paddingRight: isFullScreen ? '0' : '' }"
    select-none
    border-b="1px solid #E5E5E5"
    bg="#F8F8F8"
  >
    <div absolute top-0 right-0 bottom-0 left-0 style="-webkit-app-region: drag"></div>
    <div h-full px-2 flex items-center gap-1 justify-between>
      <div flex items-center gap-1>
        <img w="16px" h="16px" :src="icon" />
        <div relative h-full inline-flex items-center text-sm>{{ config.app_title }}</div>
        <div relative class="list">
          <div class="item" @click="onClickMenu">{{ t("browser.navbar.menu.label") }}</div>
        </div>
      </div>
      <div float-right h-full flex items-center relative style="-webkit-app-region: no-drag">
        <div
          v-if="!isHome"
          text-sm
          px-2
          flex
          items-center
          hover:rounded-md
          hover:bg-gray-2
          hover:cursor-pointer
          text="hover:hover"
          title="返回"
          @click="back"
        >
          <icon-stash:arrow-reply-duotone></icon-stash:arrow-reply-duotone>
        </div>
        <!-- <div
          v-if="!isHome"
          text-sm
          px-2
          hover:rounded-md
          hover:bg-gray-2
          hover:cursor-pointer
          text="hover:hover"
          title="返回首页"
          @click="backHome"
        >
          🏠
        </div> -->
        <div text-sm px-2 hover:rounded-md hover:bg-gray-2 hover:cursor-pointer text="hover:hover" @click="onClickAbout">关于</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import icon from "@res/icon.png"
  import config from "config"
  import { PopupMenu } from "@/bridge/PopupMenu"
  import { usePlatForm } from "common/event/PlatForm/hook"
import { LogLevel } from "logger/common"

  const PlatForm = usePlatForm()

  const router = useRouter()
  const route = useRoute()
  const isFullScreen = ref(false)
  const curLogLevel = ref<LogLevel>()

  onBeforeMount(async () => {
    isFullScreen.value = await PlatForm.isFullScreen()
    curLogLevel.value = await PlatForm.logGetLevel()
  })

  const isHome = computed(() => {
    if (route.fullPath === "/") {
      return true
    }
    return false
  })

  // function backHome() {
  //   router.push("/")
  // }
  function back() {
    router.back()
  }
  const { t } = useI18n()
  const onClickMenu = async e => {
    const menu = new PopupMenu([
      {
        label: isFullScreen.value ? t("browser.navbar.menu.quit-fullscreen") : t("browser.navbar.menu.fullscreen"),
        async click() {
          await PlatForm.toggleFullScreen()
          isFullScreen.value = !isFullScreen.value
        },
      },
      {
        label: t("browser.navbar.menu.toggleDevTools"),
        async click() {
          PlatForm.toggleDevTools()
        },
      },
      {
        label: "重载",
        async click() {
          PlatForm.reload()
        },
      },
      {
        label: "崩溃",
        async click() {
          PlatForm.crash()
        },
      },
      {
        label: "打开研发云",
        async click() {
          PlatForm.showSrd()
        },
      },
      {
        label: "打开研发云Cookie",
        async click() {
          PlatForm.getSrdCookie()
        },
      },
      {
        label: curLogLevel.value === LogLevel.TRACE ? "关闭调试模式" : "开启调试模式",
        async click() {
          if(curLogLevel.value === LogLevel.TRACE) {
            await PlatForm.logSetLevel(LogLevel.INFO)
            curLogLevel.value = LogLevel.INFO
            return
          }
          await PlatForm.logSetLevel(LogLevel.TRACE)
          curLogLevel.value = LogLevel.TRACE
        },
      },
    ])
    const obj = e.target.getBoundingClientRect()
    menu.show({ x: ~~obj.x, y: ~~(obj.y + obj.height) })
  }

  const onClickAbout = () => {
    PlatForm.showAbout()
  }
</script>

<style lang="scss" scoped>
  .list {
    @apply: flex gap="5px";
    -webkit-app-region: no-drag;

    .item {
      @apply: text-sm px-2 hover:rounded-md hover:bg-gray-2 hover:cursor-pointer text="hover:hover";
    }
  }
</style>

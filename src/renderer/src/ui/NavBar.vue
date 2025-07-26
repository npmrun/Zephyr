<template>
  <div
    relative
    h="30px"
    leading="29px"
    pr="137px"
    :style="{ paddingRight: PlatForm.isFullScreen.value ? '0' : '' }"
    select-none
    border-b="1px solid #E5E5E5"
    bg="#F8F8F8"
  >
    <div absolute top-0 right-0 bottom-0 left-0 style="-webkit-app-region: drag"></div>
    <div h-full px-2 flex items-center gap-1 justify-between>
      <div flex items-center gap-1>
        <img w="16px" h="16px" :src="icon" />
        <div relative h-full inline-flex items-center text-sm>{{ Config.ExeConfig.name }}</div>
        <div relative class="list">
          <div v-for="(menu, index) in menuList" :key="index" class="item" @click="menu.click">{{ menu.label }}</div>
        </div>
      </div>
      <div float-right h-full flex items-center relative style="-webkit-app-region: no-drag">
        <Update />
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
        <div text-sm px-2 hover:rounded-md hover:bg-gray-2 hover:cursor-pointer text="hover:hover" @click="onClickAbout">关于</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import icon from "@res/icon.png"
  import Config from "config"
  import { PopupMenu } from "@/bridge/PopupMenu"
  // import { usePlatForm } from "common/event/PlatForm/hook"
  import { LogLevel } from "logger/common"
  import Update from "./Update.vue"

  const PlatForm = useApiPlatForm()

  const router = useRouter()
  const route = useRoute()
  const curLogLevel = ref<LogLevel>()

  onBeforeMount(async () => {
    curLogLevel.value = await PlatForm.power.logGetLevel()
  })

  const isHome = computed(() => {
    if (route.fullPath === "/") {
      return true
    }
    return false
  })

  function back() {
    router.back()
  }
  const { t } = useI18n()
  const menuList = [
    {
      label: t("browser.navbar.menu.label"),
      async click(e) {
        const menu = new PopupMenu([
          {
            label: "首选项",
            async click() {
              router.push("/setting")
            },
          },
          {
            label: t("browser.navbar.menu.toggleDevTools"),
            async click() {
              PlatForm.power.toggleDevTools()
            },
          },
          {
            label: "重载",
            async click() {
              PlatForm.power.reload()
            },
          },
          {
            label: "崩溃",
            async click() {
              PlatForm.power.crash()
            },
          },
        ])
        const obj = e.target.getBoundingClientRect()
        menu.show({ x: ~~obj.x, y: ~~(obj.y + obj.height) })
      },
    },
    {
      label: "查看",
      async click(e) {
        const menu = new PopupMenu([
          {
            label: PlatForm.isFullScreen.value ? t("browser.navbar.menu.quit-fullscreen") : t("browser.navbar.menu.fullscreen"),
            async click() {
              PlatForm.toggleFullScreen()
            },
          },
        ])
        const obj = e.target.getBoundingClientRect()
        menu.show({ x: ~~obj.x, y: ~~(obj.y + obj.height) })
      },
    },
  ]

  const onClickAbout = () => {
    PlatForm.power.showAbout()
  }
</script>

<style lang="scss" scoped>
  .list {
    @apply: flex gap-5px;
    -webkit-app-region: no-drag;

    .item {
      @apply: text-sm px-2 hover:rounded-md hover:bg-gray-2 hover:cursor-pointer text="hover:hover";
    }
  }

  .rotate {
    animation: rotate 1.5s linear infinite forwards running;
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
</style>

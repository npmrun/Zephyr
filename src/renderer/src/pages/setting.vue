<script setup lang="ts">
  import Simplebar from "simplebar-vue"

  const settingStore = useApiSetting()

  const router = useRouter()

  const active = ref(0)

  const allApp = reactive([
    { label: "基础设置", path: "/setting/" },
    { label: "更新设置", path: "/setting/update" },
    { label: "开发设置", path: "/setting/dev" },
  ])

  watchEffect(() => {
    const currentPath = router.currentRoute.value.path
    const index = allApp.findIndex(app => app.path === currentPath)
    if (index !== -1) {
      active.value = index
    }
  })

  function onClick(app: any, index: number) {
    active.value = index
    router.replace(app.path)
  }

  function onClickSave() {
    settingStore
      .save()
      .then(() => {
        toast("设置已保存", { type: "success" })
      })
      .catch(() => {
        toast("保存失败，请重试", { type: "error" })
      })
  }

  function onClickReset() {
    settingStore.reset()
    toast("设置已重置", { type: "info" })
  }
</script>

<template>
  <div h-full flex>
    <div w="100px" h-full relative max-w="500px" min-w="100px">
      <Simplebar h-full>
        <div
          v-for="(app, index) in allApp"
          :key="index"
          p="8px 10px"
          text="12px"
          border
          border-b
          h="30px"
          cursor="pointer"
          hover:bg-gray-50
          class="item"
          transition-all
          :class="{ active: active === index }"
          @click="onClick(app, index)"
        >
          <div class="text" transition-all position="absolute" left="10px">{{ app.label }}</div>
        </div>
      </Simplebar>
      <AdjustLine></AdjustLine>
    </div>
    <div class="content" relative b-l="1px solid #E5E5E5" flex-1 w-0 overflow-auto flex flex-col>
      <RouterView v-slot="{ Component, route }">
        <Transition name="slide-fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </RouterView>
    </div>
    <div v-if="!settingStore.isSame" absolute bottom-20px right-20px flex flex-col gap-20px>
      <div
        :disabled="settingStore.isSaving"
        shadow
        flex-center
        cursor-pointer
        rounded="50%"
        p="10px"
        bg="blue-500"
        color="white"
        @click="onClickSave"
      >
        <icon-material-symbols:save></icon-material-symbols:save>
      </div>
      <div :disabled="settingStore.isSaving" shadow flex-center cursor-pointer rounded="50%" p="10px" bg="white" @click="onClickReset">
        <icon-ix:reset></icon-ix:reset>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .item {
    position: relative;
    display: flex;
    align-items: center;
    white-space: nowrap;
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 6px;
      background-color: #f3f4f6;
      transition: all linear 300ms;
    }
    &:hover {
      &::before {
        width: 30px;
      }
      .text {
        left: 20px;
      }
    }
    &.active {
      @apply: text-black;
      &::before {
        width: 100%;
      }
      .text {
        left: 50%;
        transform: translateX(-50%);
      }
    }
    .text {
      transition-duration: 300ms;
    }
  }
</style>

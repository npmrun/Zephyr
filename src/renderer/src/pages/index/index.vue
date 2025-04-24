<script setup lang="ts">
  import { useSnippet } from "common/event/Snippet/hook"
  definePage({
    meta: {
      home: true,
    },
  })

  const { getTree } = useSnippet()

  const activeLeft = ref<number | null>(null)
  function clickActive(e: any) {
    const el = e.target as HTMLDivElement
    const { x } = el.getBoundingClientRect()
    const { width: parentWidth } = el.parentElement!.getBoundingClientRect()
    const newLeft = +((x / parentWidth) * 100).toFixed(2)
    if (newLeft === activeLeft.value) {
      activeLeft.value = null
      return
    }
    activeLeft.value = +((x / parentWidth) * 100).toFixed(2)
  }

  async function click() {
    console.log(await getTree())
  }
</script>

<template>
  <div h-full flex>
    <div border-r-coolGray-200 border-r-1 border-r-solid flex flex-col max-w-300px w="3/10">
      <div class="list">
        <div v-if="activeLeft !== null" class="active" :style="{ left: activeLeft + '%' }"></div>
        <div class="item" @click="clickActive">
          <IconHugeiconsInbox class="icon" />
          <span class="text">盒子</span>
        </div>
        <div class="item" @click="clickActive">
          <IconFluentCollections24Regular class="icon" />
          <span class="text">收藏</span>
        </div>
        <div class="item" @click="clickActive">
          <IconSolarHome2Outline class="icon" />
          <span class="text">全部</span>
        </div>
        <div class="item" @click="clickActive">
          <IconMynauiTrash class="icon" />
          <span class="text">废纸篓</span>
        </div>
      </div>
      <div @click="click">文件树</div>
    </div>
    <div max-w-300px w="3/10" border-r-coolGray-200 border-r-1 border-r-solid>文件树</div>
    <div>aa</div>
  </div>
</template>

<style lang="scss" scoped>
  .list {
    @apply flex border-b-solid border-b-1 border-b-coolGray-200 relative;
    .active {
      position: absolute;
      left: 0;
      transition: left 0.5s ease;
      width: 25%;
      height: 100%;
      pointer-events: none;
      background-color: rgba(193, 193, 193, 0.2);
      z-index: -1;
    }
    .item {
      @apply p-x-3 p-y-2 cursor-pointer flex flex-col gap-1 flex-1 items-center hover:bg-gray-100;
      .icon {
        @apply w-5 h-5;
        pointer-events: none;
      }
      .text {
        @apply text-xs;
        pointer-events: none;
      }
    }
  }
</style>

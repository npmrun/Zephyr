<script setup lang="ts">
  import { useUpdaterStore } from "common/event/Updater/hook"

  const UpdaterStore = useUpdaterStore()
</script>

<template>
  <div gap="20px" h-full>
    <div p="20px" flex flex-wrap items-start gap="20px" justify-start>
      <div w="calc((100%-4*20px)/5)" shadow v-for="i in 10" :key="i">
        <div p-2 text-lg font-bold>导航站</div>
        <div p-2 pt-0 text-sm>这是一个导航站</div>
        <div flex gap="10px" px-4 py-2 tex border-t="1px solid #E5E5E5">
          <div cursor="pointer" text-sm leading-1 py-2 px-3 border="1px solid #E5E5E5" rounded>查看</div>
          <div cursor="pointer" text-sm leading-1 py-2 px-3 border="1px solid #E5E5E5" rounded>访问</div>
        </div>
      </div>
      <button @click="UpdaterStore.checkForUpdates()">更新</button>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

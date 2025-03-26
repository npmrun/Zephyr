<script lang="ts" setup>
  import Simplebar from "simplebar-vue"
</script>

<template>
  <Simplebar h-full>
    <RouterView></RouterView>
  </Simplebar>
</template>

<style scoped>
  :deep(.simplebar-content) {
    height: 100%;
  }
</style>

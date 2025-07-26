<script setup lang="ts">
  const getKey = route => {
    if (route.matched.length > 0) {
      for (let i = 0; i < route.matched.length; i++) {
        const r = route.matched[i]
        if (r.meta?.isLayout) {
          return r.path
        }
      }
    }
    return route.fullPath
  }
</script>

<template>
  <div h-full flex flex-col overflow-hidden>
    <NavBar></NavBar>
    <div id="page-container" flex-1 h-0 overflow-hidden flex flex-col relative style="transform: scale(1)">
      <router-view v-slot="{ Component, route }">
        <Transition name="slide-fade" mode="out-in">
          <component :is="Component" :key="getKey(route)" />
        </Transition>
      </router-view>
    </div>
  </div>
</template>

<style lang="scss" scoped>

</style>

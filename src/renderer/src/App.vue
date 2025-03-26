<script setup lang="ts"></script>

<template>
  <div h-full flex flex-col overflow-hidden>
    <NavBar></NavBar>
    <div flex-1 h-0 overflow-hidden flex flex-col>
      <router-view v-slot="{ Component, route }">
        <Transition name="slide-fade" mode="out-in">
          <component :is="Component" :key="route.fullPath" />
        </Transition>
      </router-view>
    </div>
  </div>
</template>

<style lang="scss" scoped>
  .slide-fade-enter-active {
    transition: all 0.2s ease-out;
  }

  .slide-fade-leave-active {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateX(20px);
    opacity: 0;
  }
</style>

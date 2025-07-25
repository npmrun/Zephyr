<template>
  <div
    v-if="UpdaterStore.isNeedUpdate"
    text-sm
    px-2
    py-1
    flex
    items-center
    hover:bg-gray-2
    hover:cursor-pointer
    text="hover:hover"
    @click="UpdaterStore.checkForUpdates"
  >
    <icon-grommet-icons:update
      v-if="
        UpdaterStore.status === ApiUpdaterStatus.StartChecking ||
        UpdaterStore.status === ApiUpdaterStatus.Checking ||
        UpdaterStore.status === ApiUpdaterStatus.UpdateAvailable
      "
      :class="{ rotate: UpdaterStore.status === ApiUpdaterStatus.Checking }"
    ></icon-grommet-icons:update>
    <icon-bxs:error v-if="UpdaterStore.status === ApiUpdaterStatus.Error" title="更新失败" class="text-red-400"></icon-bxs:error>
  </div>
  <div
    v-if="UpdaterStore.status === ApiUpdaterStatus.Downloading"
    class="progress"
    style="font-size: 12px"
    px-2
    flex
    items-center
    bg-gray-2
    hover:cursor-pointer
    text="hover:hover"
  >
    <div class="line" :style="{ width: UpdaterStore.percent + '%' }"></div>
    <div class="speed">{{ UpdaterStore.speed }} KB/s</div>
  </div>
</template>

<script lang="ts" setup>
  const UpdaterStore = useApiUpdater()
</script>

<style lang="scss" scoped>
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
  .progress {
    background-color: rgba(229, 231, 235, 100);
    position: relative;
    .speed {
      position: relative;
      z-index: 3;
      color: red;
    }
    .line {
      content: "";
      z-index: 2;
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 0;
      background-color: rgb(239, 156, 156);
    }
  }
</style>

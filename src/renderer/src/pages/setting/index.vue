<template>
  <div h-full flex>
    <div w="200px" border-r="#E5E5E5 solid 1px">左侧菜单</div>
    <div flex="1" w="0">
      {{ settingStore.isSame }}--{{ settingStore.diffKeys }}
      <input v-model="settingStore.config['update.repo']" type="text" />
      {{ settingStore.config["update.repo"] }}
      <button v-if="!settingStore.isSame" :disabled="settingStore.isSaving" @click="settingStore.save()">保存</button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useSettingStore } from "common/event/Setting/hook"

  const settingStore = useSettingStore()
  console.log(settingStore.config)
</script>

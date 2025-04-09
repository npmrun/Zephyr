<script setup lang="ts">
  import { useDialog } from "law-ui"

  definePage({
    meta: {
      home: true,
    },
  })

  const showDialog = ref(false)

  const { show, hide } = useDialog({
    renderUI: () => import("./_ui/_dialog.vue"),
    dialogProps: {
      style: {
        width: "50%",
      }
    }
  })
</script>

<template>
  <div @click="show()">sad--{{ showDialog }}</div>asd
  <div @click="$router.push('/demo')">aaa</div>
  <!-- <Dialog inBox disabled v-model:show="showDialog">
    <template v-slot:placeholder><div class="dialog-placeholder"></div></template>
    <div bg-white>saasda</div>
  </Dialog> -->
</template>

<style lang="scss" scoped>
  // .dialog-placeholder :deep() {
  //   & + .dialog__content {
  //     width: 50%;
  //   }
  // }
</style>

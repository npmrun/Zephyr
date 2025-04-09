<script setup lang="ts">
  definePage({
    meta: {
      home: true,
    },
  })

  const showDialog = ref(false)
</script>

<template>
  <div>sad--{{ showDialog }}</div>asd
  <div @click="$router.push('/demo')">aaa</div>
</template>

<style lang="scss" scoped>

</style>

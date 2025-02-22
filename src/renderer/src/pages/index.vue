<script setup lang="ts">
import Browser from "./_ui/Browser.vue"
</script>

<template>
    <div h-full flex>
        <div w="200px" relative>
            <div p="8px 10px" text="12px" @click="$router.push('/_ui/Browser')" border border-b cursor="pointer" hover:bg-gray-100>浏览器</div>
            <div p="8px 10px" text="12px" border border-b cursor="pointer" hover:bg-gray-100>浏览器</div>
            <AdjustLine></AdjustLine>
        </div>
        <div b-l="1px solid #E5E5E5" flex-1 w-0 overflow-auto flex flex-col>
            <Browser></Browser>
        </div>
    </div>
</template>

<style lang="scss" scoped></style>

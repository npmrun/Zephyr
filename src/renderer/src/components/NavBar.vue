<template>
    <div relative h="30px" leading="29px" pr="137px" select-none border-b="1px solid #E5E5E5" bg="#F8F8F8">
        <div absolute top-0 right-0 bottom-0 left-0 style="-webkit-app-region: drag"></div>
        <div h-full px-2 flex items-center gap-1 justify-between>
            <div flex items-center gap-1>
                <img w="16px" h="16px" :src="icon" />
                <div relative h-full inline-flex items-center text-sm>{{ config.app_title }}</div>
            </div>
            <div float-right h-full flex items-center relative style="-webkit-app-region: no-drag">
                <div text-sm px-2 hover:rounded-md hover:bg-gray-2 hover:cursor-pointer text="hover:hover" @click="onClickAbout">关于</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import icon from "@res/icon.png"
import config from "config"

const onClickAbout = () => {
    fetch("api://fuck/BasicService/showAbout")
}
</script>

<style lang="scss" scoped></style>

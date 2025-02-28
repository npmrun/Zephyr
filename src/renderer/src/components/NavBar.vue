<template>
    <div
        relative
        h="30px"
        leading="29px"
        pr="137px"
        :style="{ paddingRight: isFullScreen ? '0' : '' }"
        select-none
        border-b="1px solid #E5E5E5"
        bg="#F8F8F8"
    >
        <div absolute top-0 right-0 bottom-0 left-0 style="-webkit-app-region: drag"></div>
        <div h-full px-2 flex items-center gap-1 justify-between>
            <div flex items-center gap-1>
                <img w="16px" h="16px" :src="icon" />
                <div relative h-full inline-flex items-center text-sm>{{ config.app_title }}</div>
                <div relative class="list">
                    <div class="item" @click="onClickMenu">菜单</div>
                </div>
            </div>
            <div float-right h-full flex items-center relative style="-webkit-app-region: no-drag">
                <div
                    v-if="!isHome"
                    text-sm
                    px-2
                    hover:rounded-md
                    hover:bg-gray-2
                    hover:cursor-pointer
                    text="hover:hover"
                    @click="back"
                    title="返回上一页"
                >
                    ⬅
                </div>
                <div text-sm px-2 hover:rounded-md hover:bg-gray-2 hover:cursor-pointer text="hover:hover" @click="onClickAbout">关于</div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import icon from "@res/icon.png"
import config from "config"
import { PopupMenu } from "@/bridge/PopupMenu"

const router = useRouter()
const route = useRoute()
const isFullScreen = ref(false)
onBeforeMount(async () => {
    isFullScreen.value = await api.call("BasicCommand.isFullscreen")
})

const isHome = computed(() => {
    if (route?.meta?.home) {
        return true
    }
    return false
})

function back() {
    router.back()
}

const onClickMenu = e => {
    const menu = new PopupMenu([
        {
            label: isFullScreen.value ? "取消全屏" : "全屏",
            async click() {
                isFullScreen.value = await api.call("BasicCommand.fullscreen")
            },
        },
        {
            label: "切换开发者工具",
            async click() {
                isFullScreen.value = await api.call("BasicCommand.toggleDevTools")
            },
        },
        // {
        //     type: "separator",
        // },
        // {
        //     label: "重载",
        //     click() {
        //         api.call("BasicCommand.reload")
        //     },
        // },
        // {
        //     label: "重启",
        //     click() {
        //         api.call("BasicCommand.relunch")
        //     },
        // },
    ])
    const obj = e.target.getBoundingClientRect()
    menu.show({ x: ~~obj.x, y: ~~(obj.y + obj.height) })
}

const onClickAbout = () => {
    fetch("api://fuck/BasicService/showAbout")
}
</script>

<style lang="scss" scoped>
.list {
    @apply: flex gap="5px";
    -webkit-app-region: no-drag;
    .item {
        @apply: text-sm px-2 hover:rounded-md hover:bg-gray-2 hover:cursor-pointer text="hover:hover";
    }
}
</style>

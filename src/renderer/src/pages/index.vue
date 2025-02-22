<script setup lang="ts">
import { defineAsyncComponent } from "vue"

const active = ref()
const allApp = [
    { label: "浏览器", comp: defineAsyncComponent(() => import("./_ui/Browser.vue")) },
    { label: "观山", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "听雨", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "赏月", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "抚琴", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "望云", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "踏雪", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "卧松", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "泛舟", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "弈星", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "垂钓", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "采菊", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "倚栏", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "望霞", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "枕风", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "沐泉", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "汲露", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "步竹", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "剪烛", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "拾阶", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "撷兰", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "访柳", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "谒梅", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "拨荷", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
    { label: "望鹤", comp: defineAsyncComponent(() => import("./_ui/App.vue")) },
]
</script>

<template>
    <div h-full flex>
        <div w="100px" relative max-w="200px" min-w="80px">
            <div overflow-hidden>
                <div
                    v-for="(app, index) in allApp"
                    p="8px 10px"
                    text="12px"
                    border
                    border-b
                    h="30px"
                    cursor="pointer"
                    @click="active = index"
                    hover:bg-gray-50
                    class="item"
                    transition-all
                    :class="{ active: active === index }"
                >
                    <div class="text" transition-all position="absolute" left="10px">{{ app.label }}</div>
                </div>
            </div>
            <AdjustLine></AdjustLine>
        </div>
        <div b-l="1px solid #E5E5E5" flex-1 w-0 overflow-auto flex flex-col>
            <component v-if="allApp[active]" :is="allApp[active].comp"></component>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.item {
    position: relative;
    &::before {
        content: "";
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: 6px;
        background-color: #f3f4f6;
        transition: all linear 300ms;
    }
    &:hover {
        &::before {
            width: 30px;
        }
        .text {
            left: 20px;
        }
    }
    &.active {
        @apply: text-black;
        &::before {
            width: 100%;
        }
        .text {
            left: 50%;
            transform: translateX(-50%);
        }
    }
    .text {
        transition-duration: 300ms;
    }
}
</style>

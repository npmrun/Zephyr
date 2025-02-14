<script setup lang="ts">
import NavBar from "@renderer/components/NavBar.vue"
import { onBeforeMount, onBeforeUnmount, onMounted, ref, useTemplateRef } from "vue"
import { PopupMenu } from "./bridge/PopupMenu"

const PlaceHolderRef = useTemplateRef("PlaceHolder")
function OnResize() {
    const el = PlaceHolderRef.value
    if (el) {
        const rect = el.getBoundingClientRect().toJSON()
        console.log(rect)
        api.call("TabsCommand.bindElement", rect)
    }
}
onMounted(OnResize)
window.addEventListener("resize", OnResize)
onBeforeUnmount(() => {
    window.removeEventListener("resize", OnResize)
})

const list = ref<any[]>([])
const curUrl = ref<any>("")
const curIndex = ref<any>(-1)
const listener = (_, v) => {
    list.value = v
    const el = v.find(v => v.isActive)
    curIndex.value = v.findIndex(v => v.isActive)
    if (el) {
        curUrl.value = el.showUrl
    } else {
        curUrl.value = ""
    }
}
if (import.meta.hot) {
    api.off("TabsCommand.update", listener)
}
api.on("TabsCommand.update", listener)
onMounted(() => {
    api.call("TabsCommand.sync")
})

onBeforeMount(async () => {
    list.value = await fetch("api://fuck/TabsService/getAllTabs").then(async res => await res.json())
})

// const url = ref("")

// async function addTab() {
//     if (!url.value) url.value = "about:blank"
//     await fetch("api://fuck/TabsService/add", {
//         method: "POST",
//         body: JSON.stringify({ url: url.value }),
//     })
//     url.value = ""
//     onClick()
// }

function handleTabContextMenu(_, index) {
    const menu = new PopupMenu([
        {
            label: "右侧关闭",
            click() {
                const all: number[] = []
                list.value.forEach((_, i) => {
                    if (i <= index) return
                    all.push(i)
                })
                fetch("api://fuck/TabsService/closeTabAll", {
                    method: "POST",
                    body: JSON.stringify({ active: all }),
                })
            },
        },
        {
            type: "separator",
        },
    ])
    menu.show()
}

function changeTab(_, index) {
    api.call("TabsCommand.setActive", index)
}

function addTabInput() {
    if (curUrl.value) {
        if (curIndex.value !== undefined && curIndex.value >= 0) {
            api.call("TabsCommand.nagivate", curIndex.value, curUrl.value)
        } else {
            api.call("TabsCommand.add", curUrl.value)
        }
    }
}
function addTab() {
    api.call("TabsCommand.add", "about:blank")
}

async function closeTab(_, index) {
    await fetch("api://fuck/TabsService/closeTab", {
        method: "POST",
        body: JSON.stringify({ active: index }),
    })
    onClick()
}

const onClick = async () => {
    list.value = await api.call("TabsCommand.getAllTabs")
    // list.value = await fetch("api://fuck/TabsService/getAllTabs").then(async res => await res.json())
    // fetch("api://fuck/BasicService/showAbout").then(async res => console.log(await res.json()))
    // fetch("api://index/openAbout", {
    //     method: "POST",
    //     body: JSON.stringify({ a: "234" }),
    // }).then(async res => console.log(await res.json()))
}

function onClickDevTool() {
    fetch("api://fuck/BasicService/openTabDevtool")
}
</script>

<template>
    <div h-full flex flex-col>
        <NavBar></NavBar>
        <div ml="200px" b-l="1px solid #E5E5E5" flex-1 h-0 overflow-auto flex flex-col>
            <div h="100px" flex flex-col b-b="1px solid #E5E5E5">
                <div flex gap-1 my-1 px-1 w-full>
                    <div
                        v-for="(item, index) in list"
                        :key="index"
                        p-1
                        b-b="1px solid gray"
                        b-l="1px solid gray"
                        b-r="1px solid gray"
                        :b-t="item.isActive ? '1px solid red' : '1px solid gray'"
                        flex
                        flex-1
                        w-0
                        items-center
                        cursor="pointer"
                        gap="5px"
                        max-w="200px"
                        @contextmenu="handleTabContextMenu(item, index)"
                        @click="changeTab(item, index)"
                    >
                        <div flex-1 w-0 line-1 text-normal>{{ item.title || "加载中..." }}</div>
                        <span p-1 rounded hover="bg-gray-2 text-hover" @click.stop="closeTab(item, index)">X</span>
                    </div>
                    <div
                        p-1
                        b-b="1px solid gray"
                        b-l="1px solid gray"
                        b-r="1px solid gray"
                        b-t="1px solid gray"
                        flex
                        items-center
                        cursor="pointer"
                        gap="5px"
                        hover="bg-gray-2 text-hover"
                    >
                        <span p-1 rounded @click.stop="addTab()">+</span>
                    </div>
                </div>
                <div mx="5px" overflow="auto" flex-1 h-0 flex items-center gap-x="5px">
                    <div flex-1 w-0 h="35px" px-3 rounded="35px" b="1px solid gray-4" flex items-center>
                        <input v-model="curUrl" placeholder="输入点什么" w-full text="16px" b-0 leading="25px" outline-0 type="text" />
                    </div>
                    <div inline-block hover="bg-gray-2 text-hover" px-1 py-1 rounded cursor="pointer" @click="addTabInput()">
                        <button text="14px" bg-transparent b-0 cursor="pointer">前往</button>
                    </div>
                    <div inline-block hover="bg-gray-2 text-hover" px-1 py-1 rounded cursor="pointer" @click="onClickDevTool()">
                        <button text="14px" bg-transparent b-0 cursor="pointer">DevTool</button>
                    </div>
                </div>
            </div>
            <div ref="PlaceHolder" ml="1px" flex-1 h-0 flex items-center justify-center>fuck</div>
        </div>
    </div>
</template>

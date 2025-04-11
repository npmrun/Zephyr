import { defineStore } from "pinia"

export enum ModuleType {
  CommonPanel = 0,
  CodeMgr = 1,
  LinkBox = 2,
}
export const useModuleStore = defineStore("module", () => {
  const curModuleId = ref<ModuleType>(ModuleType.CommonPanel)

  const modules: Record<"id" | "label", string | ModuleType>[] = [
    { id: ModuleType.CommonPanel, label: "全能面板" },
    { id: ModuleType.CodeMgr, label: "代码管家" },
    { id: ModuleType.LinkBox, label: "超链鉴宝" },
  ]

  const setModule = (type: ModuleType) => {
    console.log(type);
    curModuleId.value = type
  }
  const curModule = computed(() => {
    return modules.find(m => m.id === curModuleId.value)
  })
  return {
    ModuleType,
    setModule,
    modules,
    curModule,
  }
})

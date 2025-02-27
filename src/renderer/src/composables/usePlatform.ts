import { Tabs } from "@/platform/Tabs"

export function usePlatForm() {
    return {
        Tabs: Tabs.getInstance<Tabs>(),
    }
}

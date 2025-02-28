import { PlatForm } from "@/platform/PlatForm"
import { Tabs } from "@/platform/Tabs"

export function usePlatForm() {
    return {
        Tabs: Tabs.getInstance<Tabs>(),
        PlatForm: PlatForm.getInstance<PlatForm>(),
    }
}

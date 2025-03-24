import { PlatForm } from "./event/PlatForm"
import { Tabs } from "./event/Tabs"

export function usePlatForm() {
    return {
        Tabs: Tabs.getInstance<Tabs>(),
        PlatForm: PlatForm.getInstance<PlatForm>(),
    }
}

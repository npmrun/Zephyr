import { PlatForm } from "."

export function usePlatForm() {
  return PlatForm.getInstance<PlatForm>()
}

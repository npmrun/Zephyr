const keys = ["hot-update-ready"] as const

type AllKeys = (typeof keys)[number]

export type { AllKeys }

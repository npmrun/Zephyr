const keys = ["progress"] as const

type AllKeys = (typeof keys)[number]

export type { AllKeys }

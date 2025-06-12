export function isPromise(value: () => any) {
  return value && Object.prototype.toString.call(value) === "[object Promise]"
}

export function slash(path: string) {
  const isExtendedLengthPath = path.startsWith("\\\\?\\")
  if (isExtendedLengthPath) {
    return path
  }
  return path.replace(/\\/g, "/")
}

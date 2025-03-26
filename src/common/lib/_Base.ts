export abstract class _Base {
  static instance

  static getInstance<T>(): T {
    if (!this.instance) {
      // 如果实例不存在，则创建一个新的实例
      // @ts-ignore ...
      this.instance = new this()
    }
    return this.instance
  }
}

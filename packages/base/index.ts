// 抽象基类，使用泛型来正确推导子类类型
abstract class BaseSingleton {
  private static _instance: any

  public constructor() {
    if (this.constructor === BaseSingleton) {
      throw new Error("禁止直接实例化 BaseOne 抽象类")
    }

    if ((this.constructor as any)._instance) {
      throw new Error("构造函数私有化失败，禁止重复 new")
    }

    // this.constructor 是子类，所以这里设为 instance
    ;(this.constructor as any)._instance = this
  }

  public static getInstance<T extends BaseSingleton>(this: new () => T): T {
    const clazz = this as any as typeof BaseSingleton
    if (!clazz._instance) {
      clazz._instance = new this()
    }
    return clazz._instance as T
  }
}

export { BaseSingleton }

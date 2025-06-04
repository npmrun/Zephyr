// import EventEmitter from "node:events"
// import { LinkedList } from "./LinkedList"

// abstract class BaseClass {
//   constructor() {}

//   public _events = new EventEmitter()
//   private _event: Function | undefined
//   private _listeners: LinkedList<any> | undefined

//   abstract fire(event: string, ...args: any[])
//   // 允许大家订阅此发射器的事件
//   get event() {
//     if (!this._event) {
//       this._event = (listener, thisArgs?: any, disposables?) => {
//         if (!this._listeners) {
//           this._listeners = new LinkedList()
//         }
//         // 往队列中添加该 Listener，同时返回一个移除该 Listener 的方法
//         const remove = this._listeners.push(!thisArgs ? listener : [listener, thisArgs])
//         let result
//         // 返回一个带 dispose 方法的结果，dispose 执行时会移除该 Listener
//         result = {
//           dispose: () => {
//             result.dispose = Emitter._noop
//             if (!this._disposed) {
//               remove()
//             }
//           },
//         }
//         if (disposables instanceof DisposableStore) {
//           disposables.add(result)
//         } else if (Array.isArray(disposables)) {
//           disposables.push(result)
//         }

//         return result
//       }
//     }
//     return
//   }

//   dispose() {}

//   abstract init(...argus: any[])
//   abstract destroy()
// }

// export { BaseClass }
// export default BaseClass

abstract class BaseClass {
  abstract init(...argus: any[])
  abstract destroy()
}

export { BaseClass }
export default BaseClass

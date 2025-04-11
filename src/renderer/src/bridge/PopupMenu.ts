/**
 * ContextMenu
 * @author: oldj
 * @homepage: https://oldj.net
 */

import { IMenuItemOption } from "#/popup-menu"
import type { PopupOptions } from "electron"

let _idx: number = 0

type OffFunction = () => void

export class PopupMenu {
  private _id: string
  private _items: IMenuItemOption[]
  private _offs: any[] = []
  private clickEvent: Function = ()=>{}

  constructor(menu_items: IMenuItemOption[]) {
    this._id = `popup_menu_${Math.floor(Math.random() * 1e8)}`
    this._items = menu_items
  }

  setClickEvent(fn: Function) {
    this.clickEvent = fn
  }

  show(popupOptions?: PopupOptions) {
    // console.log('show')
    this.onHide()
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this
    function readMenu(_items: IMenuItemOption[]) {
      return _items.map(i => {
        const d = { ...i }
        if (typeof d.click === "function") {
          const r = Math.floor(Math.random() * 1e8)
          const evt = `popup_menu_item_${_idx++}_${r}`
          const off = api.once(evt, d.click as any)
          that._offs.push(off)
          d._click_evt = evt
          delete d.click
        }
        if(!d.click) {
          const r = Math.floor(Math.random() * 1e8)
          const evt = `popup_menu_item_${_idx++}_${r}`
          const off = api.once(evt, (...argus)=>{
            that.clickEvent(i, ...argus)
          })
          that._offs.push(off)
          d._click_evt = evt
          delete d.click
        }
        if (d.submenu && Array.isArray(d.submenu)) {
          d.submenu = readMenu(d.submenu)
        }
        return d
      })
    }
    const items = readMenu(this._items)

    // popupOptions 中的 x,y 必须为整数
    api.popupMenu({
      menu_id: this._id,
      items,
      popupOptions,
    })
    ;((offs: OffFunction[]) => {
      api.once(`popup_menu_close:${this._id}`, () => {
        // console.log(`on popup_menu_close:${this._id}`)
        setTimeout(() => {
          offs.map(o => o())
        }, 100)
      })
    })(this._offs)
  }

  private onHide() {
    // console.log('hide...')
    this._offs.map(o => o())
    this._offs = []
  }
}

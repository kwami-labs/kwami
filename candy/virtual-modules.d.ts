declare module 'eventemitter3' {
  export default class EventEmitter3 {
    addListener(event: string | symbol, fn: Function, context?: any): this
    on(event: string | symbol, fn: Function, context?: any): this
    once(event: string | symbol, fn: Function, context?: any): this
    removeListener(event: string | symbol, fn?: Function, context?: any, once?: boolean): this
    off(event: string | symbol, fn?: Function, context?: any, once?: boolean): this
    removeAllListeners(event?: string | symbol): this
    emit(event: string | symbol, ...args: any[]): boolean
    eventNames(): Array<string | symbol>
    listeners(event: string | symbol): Function[]
    listenerCount(event: string | symbol): number
  }
}


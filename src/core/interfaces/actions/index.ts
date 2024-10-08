import { IContext } from '../context'
import { IPolicy } from '../policies'

type IActionParam = Record<string, unknown>

interface IAction<T extends IContext = IContext, V extends IActionParam = IActionParam> {
  id: unknown
  name?: string
  policies: IPolicy<T> | IPolicy<T>[] | IPolicy<T>[][] | null
  exec: (params: V) => Promise<unknown>
}

interface IActionBuilder<T extends IContext, V extends IActionParam> {
  build: (actions: IAction<T, V>[], context: T) => IAction<T, V>[]
}

interface IActionManager<T extends IContext = IContext, V extends IActionParam = IActionParam> {
  setContext(context: T): void
  getContext(): T
  addAction(action: IAction<T, V>): void
  setActions(actions: IAction<T, V>[]): void
  getActions(): IAction<T, V>[]
  canExecute(actionID: string): Promise<boolean>
  execute<R>(actionID: string, params: V): Promise<R>
}

export type { IActionParam, IPolicy, IAction, IActionBuilder, IActionManager }

import { IContext } from '../context'
import { IPolicy } from '../policies'

type IActionParam = Record<string, unknown>

interface IAction<T extends IContext, V extends IActionParam> {
  id: unknown
  name: string
  policies: IPolicy<T> | IPolicy<T>[] | IPolicy<T>[][] | null
  exec?: (params: V) => Promise<unknown>
}

interface IActionBuilder<T extends IContext, V extends IActionParam> {
  build: (actions: IAction<T, V>[], context: T) => IAction<T, V>[]
}

interface IActionManager<T extends IContext, V extends IActionParam> {
  addAction(action: IAction<T, V>): void
  setActions(actions: IAction<T, V>[]): void
  getActions(): IAction<T, V>[]
  canExecute(actionID: string): boolean
  execute<R>(actionID: string, params: V): Promise<R>
}

export type { IActionParam, IPolicy, IAction, IActionBuilder, IActionManager }

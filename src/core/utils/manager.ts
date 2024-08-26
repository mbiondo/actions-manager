import { IAction, IActionManager, IActionParam } from '@core/interfaces/actions'
import { IContext } from '@core/interfaces/context'

class ActionManager<T extends IContext, V extends IActionParam> implements IActionManager<T, V> {
  private actions: IAction<T, V>[] = []
  private context: T

  constructor(context: T) {
    this.context = context
  }

  public setActions(actions: IAction<T, V>[]): void {
    this.actions = actions
  }

  public addAction(action: IAction<T, V>): void {
    this.actions.push(action)
  }

  public getActions(): IAction<T, V>[] {
    return this.actions.filter((action) => this.testAction(action))
  }

  public canExecute(actionID: string): boolean {
    const action = this.actions.find((action) => action.id === actionID)
    if (!action) return false
    return this.testAction(action)
  }

  public async execute<R>(actionID: string, params: V): Promise<R> {
    const action = this.actions.find((action) => action.id === actionID)
    if (!action) throw new Error(`Action ${actionID} not found`)
    if (!this.testAction(action)) throw new Error(`Action ${actionID} not allowed`)
    if (!action.exec) throw new Error(`Action ${actionID} has no exec method`)
    return action.exec(params) as R
  }

  private testAction(action: IAction<T, V>): boolean {
    if (action.policies === null) return true
    if (Array.isArray(action.policies))
      return action.policies.every((policy) => {
        if (Array.isArray(policy)) return policy.some((p) => p.test(this.context))
        return policy.test(this.context)
      })
    return action.policies.test(this.context)
  }
}

export default ActionManager

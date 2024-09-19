import { IAction, IActionManager, IActionParam } from '../interfaces/actions'
import { IContext } from '../interfaces/context'

class ActionManager<T extends IContext = IContext, V extends IActionParam = IActionParam>
  implements IActionManager<T, V>
{
  private actions: IAction<T, V>[] = []
  private context: T

  constructor(context: T) {
    this.context = context
  }

  public setContext(context: T): void {
    this.context = context
  }

  public getContext(): T {
    return this.context
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

  public async canExecute(actionID: string): Promise<boolean> {
    const action = this.actions.find((action) => action.id === actionID)
    if (!action) return false
    return this.testAction(action)
  }

  public async execute<R>(actionID: string, params: V): Promise<R> {
    const action = this.actions.find((action) => action.id === actionID)
    if (!action) throw new Error(`Action ${actionID} not found`)
    const allowed = await this.testAction(action)
    if (!allowed) throw new Error(`Action ${actionID} not allowed`)
    if (!action.exec) throw new Error(`Action ${actionID} has no exec method`)
    return action.exec(params) as R
  }

  private async testAction(action: IAction<T, V>): Promise<boolean> {
    if (action.policies === null) return true

    if (Array.isArray(action.policies)) {
      const policyResults = await Promise.allSettled(
        action.policies.map(async (policy) => {
          if (Array.isArray(policy)) {
            const nestedResults = await Promise.allSettled(policy.map((p) => p.test(this.context)))
            return nestedResults.some((result) => result.status === 'fulfilled' && result.value === true)
          } else {
            try {
              return await policy.test(this.context)
            } catch (error) {
              console.error(`Error en policy test:`, error)
              return false
            }
          }
        }),
      )
      return policyResults.every((result) => result.status === 'fulfilled' && result.value === true)
    }

    try {
      return await action.policies.test(this.context)
    } catch (error) {
      console.error(`Error en policy test:`, error)
      return false
    }
  }
}

export default ActionManager

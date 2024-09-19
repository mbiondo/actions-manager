import { IContext } from '../context'

interface IPolicy<T extends IContext = IContext> {
  test: (context: T) => Promise<boolean>
}

export type { IPolicy }

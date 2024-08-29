import { IContext } from '../context'

interface IPolicy<T extends IContext = IContext> {
  test: (context: T) => boolean
}

export type { IPolicy }

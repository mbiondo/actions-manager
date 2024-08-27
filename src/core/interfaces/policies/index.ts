import { IContext } from '../context'

interface IPolicy<T extends IContext> {
  test: (context: T) => boolean
}

export type { IPolicy }

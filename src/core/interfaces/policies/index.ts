import { IContext } from '../context/index'

interface IPolicy<T extends IContext> {
  test: (context: T) => boolean
}

export type { IPolicy }

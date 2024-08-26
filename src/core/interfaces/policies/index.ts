import { IContext } from '@core/interfaces/context/index'

interface IPolicy<T extends IContext> {
  test: (context: T) => boolean
}

export type { IPolicy }

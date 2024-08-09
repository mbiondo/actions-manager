type IContext = Record<string, unknown>

type IActionParam = Record<string, unknown>

interface IPolicy<T extends IContext> {
	test: (context: T) => boolean
}

interface IAction<T extends IContext, V extends IActionParam> {
	id: unknown
	name: string
	policies: IPolicy<T> | IPolicy<T>[] | null
	exec?: (params: V) => Promise<unknown>
}

interface IActionBuilder<T extends IContext, V extends IActionParam> {
	build: (actions: IAction<T, V>[], context: T) => IAction<T, V>[]
}

export { IContext, IActionParam, IPolicy, IAction, IActionBuilder }

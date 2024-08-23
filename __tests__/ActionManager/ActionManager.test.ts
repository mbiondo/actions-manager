import ActionManager from '../../src/core/utils/manager'
import { IAction, IActionParam } from '../../src/core/interfaces/actions'
import { IContext } from '../../src/core/interfaces/context'

interface TestContext extends IContext {
  userRole: string
}

interface TestParams extends IActionParam {
  someValue: string
}

const mockContext: TestContext = { userRole: 'admin' }

const mockAction: IAction<TestContext, TestParams> = {
  id: 'test-action',
  name: 'Test Action',
  policies: [
    {
      test: (context: TestContext) => context.userRole === 'admin',
    },
  ],
  exec: async (params: TestParams) => `Executed with ${params.someValue}`,
}

describe('ActionManager', () => {
  let actionManager: ActionManager<TestContext, TestParams>

  beforeEach(() => {
    actionManager = new ActionManager(mockContext)
  })

  test('should add and retrieve actions', () => {
    actionManager.addAction(mockAction)
    const actions = actionManager.getActions()
    expect(actions).toHaveLength(1)
    expect(actions[0]).toEqual(mockAction)
  })

  test('should execute an allowed action', async () => {
    actionManager.addAction(mockAction)
    const result = await actionManager.execute<string>('test-action', { someValue: 'test' })
    expect(result).toBe('Executed with test')
  })

  test('should not execute a disallowed action', async () => {
    const disallowedAction: IAction<TestContext, TestParams> = {
      ...mockAction,
      policies: [
        {
          test: (context: TestContext) => context.userRole !== 'admin',
        },
      ],
    }
    actionManager.addAction(disallowedAction)
    await expect(actionManager.execute('test-action', { someValue: 'test' })).rejects.toThrow(
      'Action test-action not allowed',
    )
  })

  test('should return false for canExecute when action is not found', () => {
    const canExecute = actionManager.canExecute('non-existent-action')
    expect(canExecute).toBe(false)
  })

  test('should return true for canExecute when action is allowed', () => {
    actionManager.addAction(mockAction)
    const canExecute = actionManager.canExecute('test-action')
    expect(canExecute).toBe(true)
  })
})

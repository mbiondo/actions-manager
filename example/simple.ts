import { ActionManager, type IPolicy } from '../src'

const testPolicy: IPolicy = {
  test: async (ctx: any): Promise<boolean> => {
    return true
  },
}
const canPlayPolicy: IPolicy = {
  test: async (ctx: any): Promise<boolean> => {
    return ctx.songPlayer === true
  },
}

const actionManager = new ActionManager({
  songPlayer: true,
})

actionManager.addAction({
  name: 'test',
  id: 'test',
  policies: testPolicy,
  exec: async () => {
    return 'Hello World'
  },
})

actionManager.addAction({
  name: 'play',
  id: 'play',
  policies: canPlayPolicy,
  exec: async ({ song }) => {
    return `Playing ${song}`
  },
})

const canExecuteTest = await actionManager.canExecute('test')
const canExecutePlay = await actionManager.canExecute('play')
if (canExecuteTest) console.log(await actionManager.execute('test', {}))
if (canExecutePlay) console.log(await actionManager.execute('play', { song: 'Never Gonna Give You Up' }))

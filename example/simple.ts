import { ActionManager, type IPolicy } from '../src'

const testPolicy: IPolicy = {
  test: (ctx: any): boolean => {
    return true
  },
}
const canPlayPolicy: IPolicy = {
  test: (ctx: any): boolean => {
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

if (actionManager.canExecute('test')) console.log(await actionManager.execute('test', {}))
if (actionManager.canExecute('play'))
  console.log(await actionManager.execute('play', { song: 'Never Gonna Give You Up' }))

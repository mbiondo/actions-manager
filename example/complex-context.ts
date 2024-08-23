import { IAction, IActionParam } from '../src/core/interfaces/actions'
import { IContext } from '../src/core/interfaces/context'
import { IPolicy } from '../src/core/interfaces/policies'
import ActionManager from '../src/core/utils/manager'

interface SimpleContext extends IContext {
  user: {
    id: string
    roles: string[]
  }
  article: {
    id: string
    authorId: string
  }
}

interface ArticleActionParams extends IActionParam {
  id?: string
  title?: string
  content?: string
}

const isAdminPolicy: IPolicy<SimpleContext> = {
  test(context: SimpleContext): boolean {
    return context.user.roles.includes('admin')
  },
}

const isEditorPolicy: IPolicy<SimpleContext> = {
  test(context: SimpleContext): boolean {
    return context.user.roles.includes('editor')
  },
}

const isOwnerPolicy: IPolicy<SimpleContext> = {
  test(context: SimpleContext): boolean {
    return context.user.id === context.article.authorId
  },
}

const editArticleAction: IAction<SimpleContext, ArticleActionParams> = {
  id: 'edit-article',
  name: 'Edit Article',
  policies: [[isAdminPolicy, isEditorPolicy, isOwnerPolicy]],
  exec(params: ArticleActionParams): Promise<boolean> {
    // Do something
    return Promise.resolve(true)
  },
}

const deleteArticleAction: IAction<SimpleContext, ArticleActionParams> = {
  id: 'delete-article',
  name: 'Delete Article',
  policies: isOwnerPolicy,
  exec(params: ArticleActionParams): Promise<boolean> {
    // Do something
    return Promise.resolve(true)
  },
}

const viewArticleAction: IAction<SimpleContext, ArticleActionParams> = {
  id: 'view-article',
  name: 'View Article',
  policies: null,
  exec(params: ArticleActionParams): Promise<boolean> {
    // Do something
    return Promise.resolve(true)
  },
}

const actions = [editArticleAction, deleteArticleAction, viewArticleAction]

const appContext: SimpleContext = {
  user: {
    id: '123',
    roles: ['admin'],
  },
  article: {
    id: '456',
    authorId: '123',
  },
}

const ArticleActionManager = new ActionManager<SimpleContext, ArticleActionParams>(appContext) // ActionManager<SimpleContext, ArticleActionParams>

ArticleActionManager.setActions(actions)

const canEditArticle = ArticleActionManager.canExecute('edit-article') // true
const canDeleteArticle = ArticleActionManager.canExecute('delete-article') // true
const canViewArticle = ArticleActionManager.canExecute('view-article') // true

if (canViewArticle) {
  ArticleActionManager.execute('view-article', { id: '456' })
}

if (canEditArticle) {
  ArticleActionManager.execute('edit-article', { id: '456', title: 'New Title', content: 'New Content' })
}

if (canDeleteArticle) {
  ArticleActionManager.execute('delete-article', { id: '456' })
}

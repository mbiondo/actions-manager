import { IAction, IActionParam } from "../src/core/interfaces/actions"
import { IContext } from "../src/core/interfaces/context"
import { IPolicy } from "../src/core/interfaces/policies"
import ActionManager from "../src/core/utils/manager"
import Fetcher from "../src/core/utils/fetcher"
import { Endpoint, IEndpointInput, IEndpointResponse } from "../src/core/interfaces"

const fetcher = Fetcher.getInstance()

interface DeleteArticleResponse extends IEndpointResponse {
	status: number
	message: string
	data: unknown
}

interface DeleteArticleInput extends IEndpointInput {
	id: string
}

const DeleteArticleEndpoint: Endpoint = {
	name: "Delete Article",
	description: "Delete an article",
	id: "delete-article",
	method: "DELETE",
	path: "/articles/:id",
	tags: ["Articles"],
	parameters: [
		{
			name: "id",
			description: "Article ID",
			scope: "path",
			required: true,
			type: "string",
		},
	],
	mapper: {
		map(response: IEndpointResponse): DeleteArticleResponse {
			return response as DeleteArticleResponse
		},
	},
}

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

const isOwnerPolicy: IPolicy<SimpleContext> = {
	test(context: SimpleContext): boolean {
		return context.user.id === context.article.authorId
	},
}

const deleteArticleAction: IAction<SimpleContext, ArticleActionParams> = {
	id: "delete-article",
	name: "Delete Article",
	policies: isOwnerPolicy,
	exec: async (params: ArticleActionParams): Promise<boolean> => {
		const response = await fetcher.fetch<DeleteArticleResponse, DeleteArticleInput>(DeleteArticleEndpoint, { id: params.id as string })
		return response.status === 200
	},
}

const appContext: SimpleContext = {
	user: {
		id: "123",
		roles: ["admin"],
	},
	article: {
		id: "456",
		authorId: "123",
	},
}

const ArticleActionManager = new ActionManager<SimpleContext, ArticleActionParams>(appContext) // ActionManager<SimpleContext, ArticleActionParams>

ArticleActionManager.addAction(deleteArticleAction)

const canDeleteArticle = ArticleActionManager.canExecute("delete-article") // true

if (canDeleteArticle) console.log(await ArticleActionManager.execute("delete-article", { id: "456" }))

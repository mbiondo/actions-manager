interface IEndpointResponse {
  status?: number
  message?: string
  data?: unknown
}

interface IEndpointInput {
  [key: string]: string | number | boolean | Record<string, unknown> | string[] | number[] | Record<string, unknown>[]
}

interface IMapper {
  map(data: IEndpointResponse): unknown
}

interface Endpoint {
  id: string
  name: string
  method: string
  path: string
  description: string
  tags: string[]
  parameters: IParameter[]
  permissions?: string | string[]
  mapperKey?: string
  mapper?: IMapper
}

interface IParameter {
  name: string
  type: string
  description: string
  scope: 'query' | 'body' | 'path'
  required: boolean
  default?: string
}

export type { IMapper, Endpoint, IParameter, IEndpointInput, IEndpointResponse }

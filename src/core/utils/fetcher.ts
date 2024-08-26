import type { Endpoint, IEndpointInput, IEndpointResponse, IError } from '@core/interfaces'
import { IHttpClient } from '@core/interfaces/http'

import DefaultHTTPClient from './httpClient'

class Fetcher {
  private static instance: Fetcher
  private httpClient!: IHttpClient

  private constructor() {
    this.setHttpClient(DefaultHTTPClient)
  }

  public static getInstance(): Fetcher {
    if (!Fetcher.instance) {
      Fetcher.instance = new Fetcher()
    }
    return Fetcher.instance
  }

  public setHttpClient(httpClient: IHttpClient): void {
    this.httpClient = httpClient
  }

  public getHttpClient(): IHttpClient {
    return this.httpClient
  }

  public async fetch<T extends IEndpointResponse, V extends IEndpointInput>(
    endpoint: Endpoint,
    params: V,
    headers?: Record<string, string>,
  ): Promise<T> {
    if (!this.httpClient) throw new Error('Axios not set')

    const requiredParams = endpoint.parameters.filter((p) => p.required && p.default === undefined)

    requiredParams.forEach((p) => {
      if (!params[p.name] && p.default === undefined) throw new Error(`Missing required parameter: ${p.name}`)
    })

    const queryParameters = endpoint.parameters.filter((p) => p.scope === 'query')
    const query = new URLSearchParams()

    queryParameters.forEach((p) => {
      if (params[p.name] || params[p.name] == 0) {
        if (Array.isArray(params[p.name])) {
          const forceArray = params[p.name] as string[] | number[] | Record<string, unknown>[]
          forceArray.forEach((value) => {
            if (typeof value === 'object') {
              Object.keys(value).forEach((key) => {
                query.append(`${p.name}[${key}]`, value[key] as string)
              })
            } else {
              query.append(p.name, value as string)
            }
          })
        } else if (typeof params[p.name] === 'object') {
          Object.keys(params[p.name]).forEach((key) => {
            const fObject = params[p.name] as Record<string, unknown>
            query.append(`${p.name}[${key}]`, fObject[key] as string)
          })
        } else {
          query.append(p.name, params[p.name] as string)
        }
      }
    })

    let path = `${endpoint.path}${query.toString() ? '?' + query.toString() : ''}`

    const pathParams = endpoint.parameters.filter((p) => p.scope === 'path')

    pathParams.forEach((p) => {
      if (params[p.name] || params[p.name] == 0 || p.default !== undefined) {
        const forceStr = params[p.name] as string
        path = path.replace(`:${p.name}`, forceStr.toString() ?? p.default)
      }
    })

    try {
      let { data } = await this.httpClient<T>({
        method: endpoint.method,
        url: path,
        data: params['body'] ? params['body'] : null,
        headers: headers ?? {
          'Content-Type': 'application/json',
        },
      })

      if (endpoint.mapperKey) {
        if (!data[endpoint.mapperKey as keyof T]) throw new Error('Mapper key not found')
        data = data[endpoint.mapperKey as keyof T] as T
      }
      if (endpoint.mapper) data = endpoint.mapper.map(data) as T
      return data
    } catch (error) {
      const err = error as IError
      throw new Error(err.response?.data?.message ?? err.message)
    }
  }
}

export default Fetcher

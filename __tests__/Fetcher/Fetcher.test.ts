import Fetcher from '../../src/core/utils/fetcher'
import { Endpoint, IEndpointInput, IEndpointResponse } from '../../src/core/interfaces'
import DefaultHTTPClient from '../../src/core/utils/httpClient'
import { IHttpClient } from '../../src/core/interfaces/http'

describe('Fetcher', () => {
  let fetcher: Fetcher
  let mockHttpClient: jest.MockedFunction<IHttpClient>

  beforeEach(() => {
    fetcher = Fetcher.getInstance()
    mockHttpClient = jest.fn() // Crear un mock manualmente
    fetcher.setHttpClient(mockHttpClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return the same instance', () => {
    const fetcher1 = Fetcher.getInstance()
    const fetcher2 = Fetcher.getInstance()
    expect(fetcher1).toBe(fetcher2)
  })

  it('should set and get the HttpClient', () => {
    fetcher.setHttpClient(DefaultHTTPClient)
    expect(fetcher.getHttpClient()).toBe(DefaultHTTPClient)
  })

  it('should throw an error if required parameters are missing', async () => {
    const endpoint: Endpoint = {
      id: 'test',
      name: 'test',
      description: 'test',
      path: '/test/:id',
      method: 'GET',
      tags: ['test'],
      parameters: [
        { name: 'id', scope: 'path', required: true, type: 'string', description: 'id' },
        { name: 'optional', scope: 'query', required: false, type: 'string', description: 'optional' },
      ],
    }

    const params: IEndpointInput = {}

    await expect(fetcher.fetch(endpoint, params)).rejects.toThrow('Missing required parameter: id')
  })

  it('should construct the correct URL and make a request', async () => {
    const endpoint: Endpoint = {
      id: 'test',
      name: 'test',
      description: 'test',
      path: '/test/:id',
      method: 'GET',
      tags: ['test'],
      parameters: [
        { name: 'id', scope: 'path', required: true, type: 'string', description: 'id' },
        { name: 'filter', scope: 'query', required: false, type: 'string', description: 'filter' },
      ],
    }

    const params: IEndpointInput = { id: '123', filter: 'active' }

    mockHttpClient.mockResolvedValue({
      data: { success: true },
      status: 200,
      statusText: 'OK',
    })

    const result = await fetcher.fetch<IEndpointResponse, IEndpointInput>(endpoint, params)

    expect(mockHttpClient).toHaveBeenCalledWith({
      method: 'GET',
      url: '/test/123?filter=active',
      data: null,
      headers: { 'Content-Type': 'application/json' },
    })

    expect(result).toEqual({ success: true })
  })

  it('should throw an error if the HttpClient request fails', async () => {
    const endpoint: Endpoint = {
      id: 'test',
      name: 'test',
      description: 'test',
      path: '/test/:id',
      method: 'GET',
      tags: ['test'],
      parameters: [{ name: 'id', scope: 'path', required: true, type: 'string', description: 'id' }],
    }

    const params: IEndpointInput = { id: '123' }

    mockHttpClient.mockRejectedValue(new Error('Network Error'))

    await expect(fetcher.fetch<IEndpointResponse, IEndpointInput>(endpoint, params)).rejects.toThrow('Network Error')
  })

  it('should handle mapperKey correctly', async () => {
    const endpoint: Endpoint = {
      id: 'test',
      name: 'test',
      description: 'test',
      path: '/test/:id',
      method: 'GET',
      mapperKey: 'result',
      tags: ['test'],
      parameters: [{ name: 'id', scope: 'path', required: true, type: 'string', description: 'id' }],
    }

    const params: IEndpointInput = { id: '123' }

    mockHttpClient.mockResolvedValue({
      data: { result: { success: true } },
      status: 200,
      statusText: 'OK',
    })

    const result = await fetcher.fetch<IEndpointResponse, IEndpointInput>(endpoint, params)

    expect(result).toEqual({ success: true })
  })

  it('should throw an error if mapperKey is not found', async () => {
    const endpoint: Endpoint = {
      id: 'test',
      name: 'test',
      description: 'test',
      path: '/test/:id',
      method: 'GET',
      mapperKey: 'result',
      tags: ['test'],
      parameters: [{ name: 'id', scope: 'path', required: true, type: 'string', description: 'id' }],
    }

    const params: IEndpointInput = { id: '123' }

    mockHttpClient.mockResolvedValue({
      data: {},
      status: 200,
      statusText: 'OK',
    })

    await expect(fetcher.fetch<IEndpointResponse, IEndpointInput>(endpoint, params)).rejects.toThrow(
      'Mapper key not found',
    )
  })
})

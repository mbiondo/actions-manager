import DefaultHTTPClient from '../../src/core/utils/httpClient'
import { HTTPClientResponse, IError } from '../../src/core/interfaces'

// Mock de fetch
global.fetch = jest.fn()

describe('DefaultHTTPClient', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return a successful response', async () => {
    const mockResponse = {
      status: 200,
      statusText: 'OK',
      json: jest.fn().mockResolvedValue({ data: 'test data' }),
    }

    ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

    const options = {
      url: 'https://example.com/api',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }

    const result = await DefaultHTTPClient<{ data: string }>(options)

    expect(fetch).toHaveBeenCalledWith('https://example.com/api', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      body: undefined,
    })
    expect(result).toEqual({
      data: { data: 'test data' },
      status: 200,
      statusText: 'OK',
    })
  })

  it('should throw an error when fetch fails', async () => {
    const mockError = new Error('Network Error') as IError
    mockError.response = {
      data: { message: 'Error message from server' },
    }
    ;(global.fetch as jest.Mock).mockRejectedValue(mockError)

    const options = {
      url: 'https://example.com/api',
      method: 'GET',
    }

    await expect(DefaultHTTPClient(options)).rejects.toThrow('Error message from server')
  })

  it('should throw an error with the default error message if no response is available', async () => {
    const mockError = new Error('Network Error') as IError

    ;(global.fetch as jest.Mock).mockRejectedValue(mockError)

    const options = {
      url: 'https://example.com/api',
      method: 'GET',
    }

    await expect(DefaultHTTPClient(options)).rejects.toThrow('Network Error')
  })
})

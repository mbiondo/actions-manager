import { HTTPClientResponse, IError } from '@core/interfaces'

const DefaultHTTPClient = async <T>(options: Record<string, unknown>): Promise<HTTPClientResponse<T>> => {
  try {
    const response = await fetch(options.url as string, {
      method: options.method as string,
      headers: options.headers as HeadersInit,
      body: options.data ? JSON.stringify(options.data) : undefined,
    })
    return {
      data: await response.json(),
      status: response.status,
      statusText: response.statusText,
    }
  } catch (error) {
    const err = error as IError
    throw new Error(err.response?.data?.message ?? err.message)
  }
}

export default DefaultHTTPClient

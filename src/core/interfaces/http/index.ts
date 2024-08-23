interface HTTPClientResponse<T> {
  data: T
  status: number
  statusText: string
}

interface IError extends Error {
  response?: {
    data?: {
      message?: string
    }
  }
}

type IHttpClient = <T>(options: Record<string, unknown>) => Promise<HTTPClientResponse<T>>

export type { HTTPClientResponse, IError, IHttpClient }

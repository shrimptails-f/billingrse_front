export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export type QueryParams = Record<string, string | number | boolean | undefined | null>;

export type RequestOptions<TBody = unknown> = {
  body?: TBody;
  headers?: Record<string, string>;
  query?: QueryParams;
  signal?: AbortSignal;
  credentials?: RequestCredentials;
  attachAuthToken?: boolean;
  retryOnUnauthorized?: boolean;
};

export type ApiErrorDetail = {
  field?: string;
  reason?: string;
  [key: string]: unknown;
};

export type ApiErrorPayload<TDetails = unknown> = {
  code?: string;
  message?: string;
  details?: TDetails;
};

export type ApiErrorResponse<TDetails = unknown> = {
  error: ApiErrorPayload<TDetails>;
};

export type ApiErrorBody<TDetails = unknown> =
  | ApiErrorPayload<TDetails>
  | ApiErrorResponse<TDetails>
  | string;

type ApiErrorParams<TBody, TDetails> = {
  status: number;
  body?: TBody;
  code?: string;
  message?: string;
  details?: TDetails;
};

export class ApiError<TBody = unknown, TDetails = unknown> extends Error {
  public status: number;
  public code?: string;
  public details?: TDetails;
  public body?: TBody;
  public apiMessage?: string;

  constructor(params: ApiErrorParams<TBody, TDetails>) {
    const { status, body, code, message, details } = params;

    super(message ?? `API Error (status: ${status})`);

    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.body = body;
    this.apiMessage = message;
  }
}

export const getApiErrorCode = (error: unknown): string | undefined => {
  return error instanceof ApiError ? error.code : undefined;
};

export type ClientAuthConfig = {
  refreshEndpoint: string;
  getAuthorizationHeaderValue: () => string | undefined;
  hasAuthToken: () => boolean;
  refreshAuthSession: () => Promise<boolean>;
};

export type ClientConfig = {
  baseUrl: string;
  defaultCredentials?: RequestCredentials;
  auth?: ClientAuthConfig;
};

type ExecuteRequestOptions<TBody> = RequestOptions<TBody> & {
  retriedAfterUnauthorized?: boolean;
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null;
};

const getApiErrorPayload = <TDetails>(body: unknown): ApiErrorPayload<TDetails> | undefined => {
  if (!isRecord(body)) {
    return undefined;
  }

  const candidate = isRecord(body.error) ? body.error : body;

  if (!isRecord(candidate)) {
    return undefined;
  }

  return {
    code: typeof candidate.code === 'string' ? candidate.code : undefined,
    message: typeof candidate.message === 'string' ? candidate.message : undefined,
    details: Object.prototype.hasOwnProperty.call(candidate, 'details')
      ? (candidate.details as TDetails)
      : undefined,
  };
};

const toApiError = (status: number, body?: unknown): ApiError<unknown, unknown> => {
  const payload = getApiErrorPayload(body);

  return new ApiError({
    status,
    body,
    code: payload?.code,
    message: payload?.message,
    details: payload?.details,
  });
};

const buildQueryString = (query?: QueryParams): string => {
  if (!query) {
    return '';
  }

  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    params.append(key, String(value));
  });

  const queryString = params.toString();

  return queryString ? `?${queryString}` : '';
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get('Content-Type') ?? '';
  const isJson = contentType.includes('application/json');
  const isNoContentStatus = response.status === 204 || response.status === 304;

  if (isNoContentStatus) {
    return undefined;
  }

  const rawBody = await response.text();

  if (rawBody.trim() === '') {
    return undefined;
  }

  if (!isJson) {
    return rawBody;
  }

  try {
    return JSON.parse(rawBody);
  } catch (error) {
    throw new ApiError({
      status: response.status,
      body: rawBody,
      code: 'invalid_json_response',
      message: 'Failed to parse JSON response',
      details: error,
    });
  }
};

export class Client {
  private refreshRequest: Promise<boolean> | null = null;
  private config: ClientConfig;

  constructor(config: ClientConfig) {
    this.config = config;
  }

  public async request<TResponse, TBody = unknown>(
    method: HttpMethod,
    endpoint: string,
    options: RequestOptions<TBody> = {}
  ): Promise<TResponse> {
    return this.executeRequest(method, endpoint, options);
  }

  private buildUrl(endpoint: string, query?: QueryParams): string {
    const queryString = buildQueryString(query);

    if (/^https?:\/\//i.test(endpoint)) {
      return `${endpoint}${queryString}`;
    }

    const baseUrl = this.config.baseUrl.replace(/\/+$/, '');
    const path = endpoint.replace(/^\/+/, '');

    return `${baseUrl}/${path}${queryString}`;
  }

  private buildHeaders<TBody>(
    method: HttpMethod,
    options: RequestOptions<TBody>
  ): Record<string, string> {
    const shouldSendBody = method !== 'GET' && options.body !== undefined && options.body !== null;
    const authorizationHeader =
      options.attachAuthToken === false
        ? undefined
        : this.config.auth?.getAuthorizationHeaderValue();

    return {
      ...(shouldSendBody ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
      ...(authorizationHeader ? { Authorization: authorizationHeader } : {}),
    };
  }

  private async refreshAuthSession(): Promise<boolean> {
    if (!this.config.auth) {
      return false;
    }

    if (!this.refreshRequest) {
      this.refreshRequest = this.config.auth.refreshAuthSession().finally(() => {
        this.refreshRequest = null;
      });
    }

    return this.refreshRequest;
  }

  private async executeRequest<TResponse, TBody = unknown>(
    method: HttpMethod,
    endpoint: string,
    options: ExecuteRequestOptions<TBody> = {}
  ): Promise<TResponse> {
    const {
      body,
      signal,
      query,
      credentials = this.config.defaultCredentials ?? 'include',
      retryOnUnauthorized = false,
      retriedAfterUnauthorized = false,
    } = options;

    const response = await fetch(this.buildUrl(endpoint, query), {
      method,
      headers: this.buildHeaders(method, options),
      body:
        method !== 'GET' && body !== undefined && body !== null ? JSON.stringify(body) : undefined,
      signal,
      credentials,
    });

    const responseBody = await parseResponseBody(response);

    if (!response.ok) {
      const shouldRetryUnauthorized =
        response.status === 401 &&
        retryOnUnauthorized &&
        !retriedAfterUnauthorized &&
        endpoint !== this.config.auth?.refreshEndpoint;

      if (shouldRetryUnauthorized) {
        const refreshed = await this.refreshAuthSession();

        if (refreshed && this.config.auth?.hasAuthToken()) {
          return this.executeRequest(method, endpoint, {
            ...options,
            retriedAfterUnauthorized: true,
          });
        }
      }

      throw toApiError(response.status, responseBody);
    }

    return responseBody as TResponse;
  }
}

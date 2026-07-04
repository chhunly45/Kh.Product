const mockRequestUse = jest.fn();
const mockResponseUse = jest.fn();
const mockCreate = jest.fn();

jest.mock('axios', () => ({
  __esModule: true,
  default: {
    create: mockCreate
  }
}));

describe('API service configuration', () => {
  beforeEach(() => {
    jest.resetModules();
    mockRequestUse.mockReset();
    mockResponseUse.mockReset();
    mockCreate.mockReset();
    mockCreate.mockReturnValue({
      interceptors: {
        request: { use: mockRequestUse },
        response: { use: mockResponseUse }
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    });
    localStorage.clear();
    delete process.env.VITE_API_BASE_URL;
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: 'http://localhost/', hostname: 'localhost', pathname: '/', search: '', assign: jest.fn(), replace: jest.fn() }
    });
  });
  it('creates an axios instance with default configuration and registers interceptors', async () => {
    process.env.VITE_API_BASE_URL = '  http://localhost:4000/  ';

    const apiModule = await import('../services/api');
    const api = apiModule.default;

    expect(mockCreate).toHaveBeenCalledWith({
      baseURL: 'http://localhost:4000/api',
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
    expect(mockRequestUse).toHaveBeenCalled();
    expect(api).toBeDefined();
  });

  it('attaches auth and CSRF headers for mutating requests', async () => {
    const apiModule = await import('../services/api');
    const api = apiModule.default as any;
    const mockGet = jest.fn().mockResolvedValue({ data: { csrfToken: 'csrf-123' } });
    api.get = mockGet;

    const requestInterceptor = mockRequestUse.mock.calls[0][0];
    localStorage.setItem('authToken', 'jwt-token');

    const config = { headers: {}, method: 'post' } as any;
    const result = await requestInterceptor(config);

    expect(mockGet).toHaveBeenCalledWith('/csrf-token');
    expect(result.headers.Authorization).toBe('Bearer jwt-token');
    expect(result.headers['X-CSRF-Token']).toBe('csrf-123');
  });

  it('reuses an existing CSRF token for later mutating requests', async () => {
    const apiModule = await import('../services/api');
    const api = apiModule.default as any;
    const mockGet = jest.fn().mockResolvedValue({ data: { csrfToken: 'csrf-123' } });
    api.get = mockGet;

    const requestInterceptor = mockRequestUse.mock.calls[0][0];
    const firstConfig = { headers: {}, method: 'post' } as any;
    const secondConfig = { headers: {}, method: 'delete' } as any;

    await requestInterceptor(firstConfig);
    await requestInterceptor(secondConfig);

    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('returns config unchanged for non-mutating requests', async () => {
    await import('../services/api');
    const requestInterceptor = mockRequestUse.mock.calls[0][0];

    const config = { headers: {}, method: 'get' } as any;
    const result = await requestInterceptor(config);

    expect(result).toEqual(config);
  });

  it('clears storage and redirects on expired-session responses', async () => {
    await import('../services/api');
    const responseInterceptor = mockResponseUse.mock.calls[0][1];
    const error = { response: { status: 401, data: { message: 'Invalid or expired session' } } };

    await expect(responseInterceptor(error)).rejects.toBe(error);
    expect(localStorage.getItem('authToken')).toBeNull();
    expect(localStorage.getItem('refreshToken')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(window.location.href).toContain('/login?sessionExpired=1');
  });

  it('uses production API base URL when the hostname is not localhost', async () => {
    process.env.VITE_API_BASE_URL = '';
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: 'https://konpuk.com/', hostname: 'example.com', pathname: '/' }
    });

    await import('../services/api');

    expect(mockCreate).toHaveBeenCalledWith({
      baseURL: 'https://api.konpuk.com/api',
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
  });

  it('keeps API base URL unchanged when VITE_API_BASE_URL already ends with /api', async () => {
    process.env.VITE_API_BASE_URL = 'https://custom-api.example.com/api';

    await import('../services/api');

    expect(mockCreate).toHaveBeenCalledWith({
      baseURL: 'https://custom-api.example.com/api',
      headers: {
        'Content-Type': 'application/json'
      },
      withCredentials: true
    });
  });

  it('uses fallback axios object when axios.create returns undefined', async () => {
    mockCreate.mockReturnValueOnce(undefined);

    const apiModule = await import('../services/api');
    const api = apiModule.default as any;

    expect(api).toBeDefined();
    expect(api.interceptors).toBeDefined();
    expect(typeof api.interceptors.request.use).toBe('function');
    expect(typeof api.interceptors.response.use).toBe('function');
  });

  it('does not redirect for non-expired 401 responses and still rejects the error', async () => {
    await import('../services/api');
    const responseInterceptor = mockResponseUse.mock.calls[0][1];
    const error = { response: { status: 401, data: { message: 'Session token is missing' } } };

    await expect(responseInterceptor(error)).rejects.toBe(error);
    expect(window.location.href).not.toContain('/login?sessionExpired=1');
  });
});

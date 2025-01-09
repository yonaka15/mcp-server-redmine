/**
 * Create a mock success response
 */
export function mockResponse<T = unknown>(body: T, init?: ResponseInit): Promise<Response> {
  const response = new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init
  });
  return Promise.resolve(response);
}

/**
 * Create a mock error response
 */
export function mockErrorResponse(status: number, errors: string[]): Promise<Response> {
  const response = new Response(JSON.stringify({ errors }), {
    status,
    statusText: "Error",
    headers: { "Content-Type": "application/json" }
  });
  return Promise.resolve(response);
}

/**
 * Create a mock network error
 */
export function mockNetworkError(message: string): Promise<never> {
  return Promise.reject(new Error(message));
}
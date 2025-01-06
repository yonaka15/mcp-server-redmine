export const mockResponse = (body: unknown, init?: ResponseInit): Response => {
  const response = new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init
  });
  return response;
};

export const mockErrorResponse = (status: number, errors: string[]): Response => {
  const response = new Response(JSON.stringify({ errors }), {
    status,
    statusText: "Error",
    headers: { "Content-Type": "application/json" }
  });
  return response;
};
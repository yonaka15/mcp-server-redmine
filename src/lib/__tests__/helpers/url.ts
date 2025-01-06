/**
 * Parse a URL into base path and query parameters
 * @param url - Full URL string to parse
 * @returns Object containing base URL path and parsed query parameters
 */
export function parseUrl(url: string) {
  const urlObj = new URL(url);
  const base = `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
  const params = Object.fromEntries(urlObj.searchParams.entries());
  
  return { base, params };
}
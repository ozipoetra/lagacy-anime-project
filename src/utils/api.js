export async function fetchApi(endpoint) {
  const defaultHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'application/json',
  };

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: defaultHeaders,
      signal: AbortSignal.timeout(10000), // Reduced to 10s; 30s is a bit long for a proxy browser
    });

    if (!response.ok) {
      return { data: null, error: `Server returned ${response.status}` };
    }

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const result = await response.json();
      return { data: result, error: null };
    }

    return { data: null, error: "Invalid response format" };
  } catch (err) {
    return { data: null, error: "Connection error or timeout" };
  }
}
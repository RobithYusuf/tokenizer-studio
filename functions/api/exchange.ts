// Cloudflare Pages Function - API Proxy for Exchange Rate
// Path: /api/exchange

export async function onRequest(context: any) {
  const { request } = context;

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Fetch from Exchange Rate API
    const apiUrl = 'https://api.exchangerate-api.com/v4/latest/USD';
    const response = await fetch(apiUrl);

    if (!response.ok) {
      console.error('❌ Exchange Rate API error:', response.status);
      return new Response(JSON.stringify({
        error: 'Failed to fetch exchange rate',
        status: response.status
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();

    // Return with CORS headers
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=600' // Cache for 10 minutes
      }
    });

  } catch (error: any) {
    console.error('❌ Proxy error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle OPTIONS for CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

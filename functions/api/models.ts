// Cloudflare Pages Function - API Proxy for Artificial Analysis
// Path: /api/models

export async function onRequest(context: any) {
  const { request, env } = context;

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Get API key from environment variables
    // Fallback to hardcoded key since Cloudflare Pages env vars
    // are not automatically bound to Functions context
    const apiKey = env.VITE_ARTIFICIAL_ANALYSIS_API_KEY
                || env.ARTIFICIAL_ANALYSIS_API_KEY
                || 'aa_GdugNjckGYnOcsOJfZYLBVVCEKqnupUy';

    if (!apiKey) {
      console.error('❌ API Key not configured');
      return new Response(JSON.stringify({
        error: 'API key not configured'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    // Fetch from Artificial Analysis API
    const apiUrl = 'https://artificialanalysis.ai/api/v2/data/llms/models';
    const response = await fetch(apiUrl, {
      headers: {
        'x-api-key': apiKey
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Artificial Analysis API error:', response.status, errorText.substring(0, 200));

      return new Response(JSON.stringify({
        error: 'Failed to fetch models from external API',
        status: response.status
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
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
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
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

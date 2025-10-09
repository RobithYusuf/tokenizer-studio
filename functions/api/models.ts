// Cloudflare Pages Function - API Proxy for Artificial Analysis
// Path: /api/models

export async function onRequest(context: any) {
  const { request, env } = context;

  // Only allow GET requests
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    // Debug: Log all available env keys
    console.log('🔍 Available env keys:', Object.keys(env || {}));

    // Get API key from environment variables
    const apiKey = env.VITE_ARTIFICIAL_ANALYSIS_API_KEY;

    console.log('🔍 API Key check:', {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      prefix: apiKey?.substring(0, 5) || 'none'
    });

    if (!apiKey) {
      console.error('❌ API Key not found in environment');
      return new Response(JSON.stringify({
        error: 'API key not configured',
        availableKeys: Object.keys(env || {})
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch from Artificial Analysis API
    const apiUrl = 'https://artificialanalysis.ai/api/v2/data/llms/models';
    console.log('🔍 Fetching from:', apiUrl);

    const response = await fetch(apiUrl, {
      headers: {
        'x-api-key': apiKey
      }
    });

    console.log('🔍 External API response:', {
      status: response.status,
      ok: response.ok,
      statusText: response.statusText
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Artificial Analysis API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText.substring(0, 200)
      });

      return new Response(JSON.stringify({
        error: 'Failed to fetch models from external API',
        status: response.status,
        statusText: response.statusText,
        details: errorText.substring(0, 200)
      }), {
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    console.log('✅ Successfully fetched models, count:', data?.data?.length || 'unknown');

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

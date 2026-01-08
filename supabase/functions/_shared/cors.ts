/**
 * Shared CORS headers for Supabase Edge Functions
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
}

/**
 * Handle CORS preflight requests
 */
export function handleCors(req: Request): Response | null {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  return null
}

/**
 * Add CORS headers to a response
 */
export function withCors(body: string | object, status = 200): Response {
  const responseBody = typeof body === 'string' ? body : JSON.stringify(body)
  return new Response(responseBody, {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Return an error response with CORS headers
 */
export function errorResponse(message: string, status = 400): Response {
  return withCors({ error: message }, status)
}


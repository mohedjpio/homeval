import { NextResponse } from 'next/server'

export async function GET() {
  const backend = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'NOT SET'
  
  // Try to reach the backend
  let backendStatus = 'unreachable'
  let backendError  = ''
  try {
    const res = await fetch(`${backend}/health`, { 
      signal: AbortSignal.timeout(5000) 
    })
    backendStatus = res.ok ? 'ok' : `http_${res.status}`
  } catch (e: any) {
    backendError = e?.message || 'unknown error'
  }

  return NextResponse.json({
    api_url_env:    backend,
    backend_status: backendStatus,
    backend_error:  backendError || null,
    node_env:       process.env.NODE_ENV,
  })
}

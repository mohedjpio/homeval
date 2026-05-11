import { NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

type Context = { params: Promise<{ path: string[] }> }

async function handler(req: NextRequest, context: Context) {
  const { path } = await context.params
  const joined  = path.join('/')
  const search  = req.nextUrl.search || ''
  const url     = `${BACKEND}/api/v1/${joined}${search}`

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  const auth = req.headers.get('authorization')
  if (auth) headers['Authorization'] = auth

  let body: string | undefined
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try { body = await req.text() } catch { body = undefined }
  }

  try {
    const res  = await fetch(url, { method: req.method, headers, body })
    const data = await res.text()
    return new NextResponse(data, {
      status: res.status,
      headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/json' },
    })
  } catch (err: any) {
    console.error('[proxy] error:', err?.message, '→', url)
    return NextResponse.json({ detail: 'Backend unreachable' }, { status: 502 })
  }
}

export const GET    = handler
export const POST   = handler
export const PUT    = handler
export const DELETE = handler
export const PATCH  = handler

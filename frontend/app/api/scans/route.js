import { NextResponse } from 'next/server'
import { getPool } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const pool = getPool()
    const { rows } = await pool.query('SELECT * FROM scans ORDER BY created_at DESC')
    return NextResponse.json({ scans: rows })
  } catch (err) {
    console.error('GET /api/scans error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

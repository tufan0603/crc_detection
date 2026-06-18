import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export const dynamic = 'force-dynamic'

export async function DELETE(req, { params }) {
  try {
    const sql = neon(process.env.DATABASE_URL)
    const { id } = params
    await sql`DELETE FROM scans WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('DELETE /api/scans/[id] error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

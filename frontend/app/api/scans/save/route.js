import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

export async function POST(req) {
  try {
    const sql  = neon(process.env.DATABASE_URL)
    const body = await req.json()
    const {
      patient_id, patient_name, age, gender, scan_date,
      prediction, confidence, total_slices, cancer_slices,
      threshold, models_used, model_results
    } = body

    const rows = await sql`
      INSERT INTO scans (
        patient_id, patient_name, age, gender, scan_date,
        prediction, confidence, total_slices, cancer_slices,
        threshold, models_used, model_results
      ) VALUES (
        ${patient_id ?? null}, ${patient_name ?? null}, ${age ?? null},
        ${gender ?? null}, ${scan_date ?? null}, ${prediction ?? null},
        ${confidence ?? null}, ${total_slices ?? null}, ${cancer_slices ?? null},
        ${threshold ?? null}, ${models_used ?? null},
        ${model_results ? JSON.stringify(model_results) : null}
      )
      RETURNING *
    `
    return NextResponse.json({ success: true, scan: rows[0] })
  } catch (err) {
    console.error('POST /api/scans/save error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET() {
  try {
    const db = await getDatabase()
    await db.command({ ping: 1 })

    return NextResponse.json({ ok: true, database: db.databaseName })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown database error'
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

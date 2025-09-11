import { NextResponse } from 'next/server'
import { getRentSchedules } from '../../../../lib/googleSheets'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const days = Number(url.searchParams.get('days') || 7) // upcoming next N days
    const now = new Date()
    const until = new Date(Date.now() + days * 24 * 3600 * 1000)
    const all = await getRentSchedules({ status: 'due' })
    const upcoming = all.filter((r:any) => {
      const d = new Date(r.due_date)
      return d >= now && d <= until
    })
    return NextResponse.json(upcoming)
  } catch (e:any) {
    console.error('GET /api/rents/upcoming', e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

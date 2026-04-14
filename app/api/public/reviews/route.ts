import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { mockReviews, type Review } from '@/data/mock-data'
import { mapReviewDoc } from '@/lib/db-mappers'

export async function GET() {
  try {
    const db = await getDatabase()
    let dbItems = await db.collection('reviews').find({ isPositive: true }).toArray()
    if (!dbItems.length) {
      dbItems = await db.collection('opiniones').find({}).toArray()
    }

    let items: Review[] = dbItems.map(item => mapReviewDoc(item as Record<string, unknown>))
    items = items.filter(item => item.isPositive)

    if (!items.length) {
      items = mockReviews.filter(item => item.isPositive)
    }

    items = items
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)

    return NextResponse.json(items)
  } catch (error) {
    console.error('GET /api/public/reviews error:', error)
    const fallback = mockReviews
      .filter(item => item.isPositive)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)

    return NextResponse.json(fallback)
  }
}

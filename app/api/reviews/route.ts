import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { mockReviews, type Review } from '@/data/mock-data'
import { mapReviewDoc } from '@/lib/db-mappers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const isPositiveParam = searchParams.get('isPositive')
  const minRatingParam = searchParams.get('minRating')

  try {
    const db = await getDatabase()
    let dbItems = await db.collection('reviews').find({}).toArray()
    if (!dbItems.length) {
      dbItems = await db.collection('opiniones').find({}).toArray()
    }

    let items: Review[] = dbItems.map(item => mapReviewDoc(item as Record<string, unknown>))

    if (!items.length) {
      items = [...mockReviews]
    }

    if (isPositiveParam !== null) {
      const isPositive = isPositiveParam === 'true'
      items = items.filter(item => item.isPositive === isPositive)
    }

    if (minRatingParam) {
      const minRating = Number(minRatingParam)
      if (Number.isFinite(minRating)) {
        items = items.filter(item => item.productRating >= minRating)
      }
    }

    items = items.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json(items)
  } catch (error) {
    console.error('GET /api/reviews error:', error)

    let fallback = [...mockReviews]
    if (isPositiveParam !== null) {
      const isPositive = isPositiveParam === 'true'
      fallback = fallback.filter(item => item.isPositive === isPositive)
    }
    if (minRatingParam) {
      const minRating = Number(minRatingParam)
      if (Number.isFinite(minRating)) {
        fallback = fallback.filter(item => item.productRating >= minRating)
      }
    }

    fallback = fallback.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )

    return NextResponse.json(fallback)
  }
}

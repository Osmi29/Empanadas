import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { mockReviews, type Review } from '@/data/mock-data'
import { mapReviewDoc } from '@/lib/db-mappers'

function buildStats(items: Review[]) {
  const totalReviews = items.length
  if (!totalReviews) {
    return {
      averageProductRating: 0,
      averageDeliveryRating: 0,
      totalReviews: 0,
      positivePercentage: 0,
    }
  }

  const avgProduct = items.reduce((sum, item) => sum + item.productRating, 0) / totalReviews
  const avgDelivery = items.reduce((sum, item) => sum + item.deliveryRating, 0) / totalReviews
  const positive = items.filter(item => item.isPositive).length

  return {
    averageProductRating: Math.round(avgProduct * 10) / 10,
    averageDeliveryRating: Math.round(avgDelivery * 10) / 10,
    totalReviews,
    positivePercentage: Math.round((positive / totalReviews) * 100),
  }
}

export async function GET() {
  try {
    const db = await getDatabase()
    let dbItems = await db.collection('reviews').find({}).toArray()
    if (!dbItems.length) {
      dbItems = await db.collection('opiniones').find({}).toArray()
    }

    const items: Review[] = dbItems.map(item => mapReviewDoc(item as Record<string, unknown>))

    if (!items.length) {
      return NextResponse.json(buildStats(mockReviews))
    }

    return NextResponse.json(buildStats(items))
  } catch (error) {
    console.error('GET /api/reviews/stats error:', error)
    return NextResponse.json(buildStats(mockReviews))
  }
}

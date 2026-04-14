import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { mockEventPricing } from '@/data/mock-data'

type EventPricingItem = {
  quantity: string
  pricePerUnit: number
  description: string
}

export async function GET() {
  try {
    const db = await getDatabase()
    const items = await db.collection<EventPricingItem>('eventPricing').find({}).toArray()

    if (!items.length) {
      return NextResponse.json(mockEventPricing)
    }

    return NextResponse.json(items)
  } catch (error) {
    console.error('GET /api/public/event-pricing error:', error)
    return NextResponse.json(mockEventPricing)
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { mockProducts, type Product } from '@/data/mock-data'
import { mapProductDoc } from '@/lib/db-mappers'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  const sort = searchParams.get('sort')
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? Number(limitParam) : undefined

  try {
    const db = await getDatabase()
    const query: Record<string, unknown> = {}

    if (category) {
      query.category = category as Product['category']
    }

    let dbItems = await db.collection('products').find(query).toArray()
    if (!dbItems.length) {
      dbItems = await db.collection('productos').find({}).toArray()
    }

    let items: Product[] = dbItems.map(item => mapProductDoc(item as Record<string, unknown>))
    if (category) {
      items = items.filter(item => item.category === category)
    }

    if (!items.length) {
      items = [...mockProducts]
      if (category) {
        items = items.filter(item => item.category === category)
      }
    }

    if (sort === 'top') {
      items = [...items].sort((a, b) => b.totalSold - a.totalSold)
    }

    if (limit && Number.isFinite(limit)) {
      items = items.slice(0, limit)
    }

    return NextResponse.json(items)
  } catch (error) {
    console.error('GET /api/products error:', error)

    let fallback = [...mockProducts]
    if (category) {
      fallback = fallback.filter(item => item.category === category)
    }
    if (sort === 'top') {
      fallback = fallback.sort((a, b) => b.totalSold - a.totalSold)
    }
    if (limit && Number.isFinite(limit)) {
      fallback = fallback.slice(0, limit)
    }

    return NextResponse.json(fallback)
  }
}

import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { mockProducts, type Product } from '@/data/mock-data'
import { mapProductDoc } from '@/lib/db-mappers'

export async function GET() {
  try {
    const db = await getDatabase()
    let dbItems = await db.collection('products').find({ category: 'empanada' }).toArray()
    if (!dbItems.length) {
      dbItems = await db.collection('productos').find({}).toArray()
    }

    let items: Product[] = dbItems.map(item => mapProductDoc(item as Record<string, unknown>))
    items = items.filter(item => item.category === 'empanada')

    if (!items.length) {
      items = [...mockProducts].filter(item => item.category === 'empanada')
    }

    items = items.sort((a, b) => b.totalSold - a.totalSold).slice(0, 4)
    return NextResponse.json(items)
  } catch (error) {
    console.error('GET /api/public/featured-products error:', error)
    const fallback = [...mockProducts]
      .filter(item => item.category === 'empanada')
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 4)

    return NextResponse.json(fallback)
  }
}

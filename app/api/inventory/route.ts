import { NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { mockInventory, type InventoryItem } from '@/data/mock-data'
import { mapInventoryDoc } from '@/lib/db-mappers'

export async function GET() {
  try {
    const db = await getDatabase()
    let rawItems = await db.collection('inventory').find({}).toArray()
    if (!rawItems.length) {
      rawItems = await db.collection('inventario').find({}).toArray()
    }

    const items: InventoryItem[] = rawItems.map(item => mapInventoryDoc(item as Record<string, unknown>))

    if (!items.length) {
      return NextResponse.json(mockInventory)
    }

    return NextResponse.json(items)
  } catch (error) {
    console.error('GET /api/inventory error:', error)
    return NextResponse.json(mockInventory)
  }
}

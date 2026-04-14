import type { InventoryItem, Product, Review } from '@/data/mock-data'

function toNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return fallback
}

function inferCategory(name: string): Product['category'] {
  const lower = name.toLowerCase()
  if (lower.includes('empanada')) return 'empanada'
  if (lower.includes('agua') || lower.includes('jugo') || lower.includes('bebida')) return 'bebida'
  if (lower.includes('combo')) return 'combo'
  return 'extra'
}

function toIdString(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value) return value
  if (typeof value === 'number') return String(value)
  if (value && typeof value === 'object' && 'toString' in value) {
    const asString = String(value)
    if (asString && asString !== '[object Object]') return asString
  }
  return fallback
}

function toIsoDate(value: unknown): string {
  if (typeof value === 'string' && value) return value
  if (value instanceof Date) return value.toISOString()
  return new Date().toISOString()
}

export function mapProductDoc(doc: Record<string, unknown>): Product {
  const name =
    (typeof doc.name === 'string' && doc.name) ||
    (typeof doc.nombre === 'string' && doc.nombre) ||
    'Producto'

  return {
    id: toIdString(doc.id ?? doc._id, `prod-${Date.now()}`),
    name,
    description:
      (typeof doc.description === 'string' && doc.description) ||
      (typeof doc.descripcion === 'string' && doc.descripcion) ||
      'Sin descripcion',
    price: toNumber(doc.price ?? doc.precio, 0),
    category:
      (doc.category as Product['category']) ||
      inferCategory(name),
    type: doc.type as Product['type'] | undefined,
    image:
      (typeof doc.image === 'string' && doc.image) ||
      '/placeholder.jpg',
    isAvailable:
      typeof doc.isAvailable === 'boolean'
        ? doc.isAvailable
        : typeof doc.activo === 'boolean'
        ? doc.activo
        : true,
    totalSold: toNumber(doc.totalSold ?? doc.total_sold ?? doc.vendidos, 0),
  }
}

export function mapInventoryDoc(doc: Record<string, unknown>): InventoryItem {
  const currentStock = toNumber(doc.currentStock ?? doc.stock_actual, 0)
  const minStock = toNumber(doc.minStock ?? doc.stock_minimo, 0)

  return {
    id: toIdString(doc.id ?? doc._id, `inv-${Date.now()}`),
    name:
      (typeof doc.name === 'string' && doc.name) ||
      (typeof doc.nombre_insumo === 'string' && doc.nombre_insumo) ||
      'Insumo',
    category:
      (doc.category as InventoryItem['category']) ||
      (doc.categoria as InventoryItem['category']) ||
      'ingredient',
    currentStock,
    minStock,
    unit:
      (typeof doc.unit === 'string' && doc.unit) ||
      (typeof doc.unidad === 'string' && doc.unidad) ||
      'pz',
    unitCost: toNumber(doc.unitCost ?? doc.costo, 0),
    supplier:
      (typeof doc.supplier === 'string' && doc.supplier) ||
      (typeof doc.proveedor === 'string' && doc.proveedor) ||
      'Sin proveedor',
    lastRestockDate:
      (typeof doc.lastRestockDate === 'string' && doc.lastRestockDate) ||
      (typeof doc.fecha_reposicion === 'string' && doc.fecha_reposicion) ||
      new Date().toISOString(),
    isLowStock:
      typeof doc.isLowStock === 'boolean'
        ? doc.isLowStock
        : currentStock <= minStock,
  }
}

export function mapReviewDoc(doc: Record<string, unknown>): Review {
  const productRating = toNumber(doc.productRating ?? doc.calificacion, 0)
  const deliveryRating = toNumber(doc.deliveryRating ?? doc.calificacion_entrega ?? doc.calificacion, productRating)

  return {
    id: toIdString(doc.id ?? doc._id, `rev-${Date.now()}`),
    clientId:
      (typeof doc.clientId === 'string' && doc.clientId) ||
      (typeof doc.id_usuario === 'string' && doc.id_usuario) ||
      'anon',
    clientName:
      (typeof doc.clientName === 'string' && doc.clientName) ||
      (typeof doc.nombre_usuario === 'string' && doc.nombre_usuario) ||
      'Cliente',
    orderId:
      (typeof doc.orderId === 'string' && doc.orderId) ||
      (typeof doc.id_pedido === 'string' && doc.id_pedido) ||
      'N/A',
    productRating,
    deliveryRating,
    comment:
      (typeof doc.comment === 'string' && doc.comment) ||
      (typeof doc.comentario === 'string' && doc.comentario) ||
      '',
    isPositive:
      typeof doc.isPositive === 'boolean'
        ? doc.isPositive
        : productRating >= 4,
    createdAt: toIsoDate(doc.createdAt ?? doc.fecha),
  }
}

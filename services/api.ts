// =============================================
// API SERVICES - Empanadas Business Management
// =============================================
// Este archivo contiene todos los servicios async simulados.
// Cada función simula una llamada a API con delay artificial.
// 
// PARA CONECTAR A MONGODB:
// 1. Reemplazar el contenido de cada función por fetch('/api/...')
// 2. Crear los endpoints correspondientes en /api/
// 3. Conectar cada endpoint a MongoDB usando el driver oficial
// =============================================

import {
  mockDashboardMetrics,
  mockSalesChartData,
  mockMonthlySalesData,
  mockProductSalesData,
  mockOrders,
  mockClients,
  mockProducts,
  mockCampaigns,
  mockInventory,
  mockReviews,
  mockDeliveryPersons,
  mockPublicMetrics,
  mockEventPricing,
  mockTeamMembers,
  type DashboardMetrics,
  type Order,
  type Client,
  type Product,
  type Campaign,
  type InventoryItem,
  type Review,
  type DeliveryPerson,
} from '@/data/mock-data'

// Simula delay de red
const simulateDelay = (ms: number = 500) => 
  new Promise(resolve => setTimeout(resolve, ms))

// =============================================
// DASHBOARD
// =============================================

/**
 * Obtiene las métricas del dashboard
 * TODO: Reemplazar por fetch('/api/dashboard/metrics')
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  await simulateDelay(300)
  return mockDashboardMetrics
}

/**
 * Obtiene datos para la gráfica de ventas semanales
 * TODO: Reemplazar por fetch('/api/dashboard/sales-chart?period=week')
 */
export async function getWeeklySalesChart() {
  await simulateDelay(400)
  return mockSalesChartData
}

/**
 * Obtiene datos para la gráfica de ventas mensuales
 * TODO: Reemplazar por fetch('/api/dashboard/sales-chart?period=month')
 */
export async function getMonthlySalesChart() {
  await simulateDelay(400)
  return mockMonthlySalesData
}

/**
 * Obtiene datos para la gráfica de productos
 * TODO: Reemplazar por fetch('/api/dashboard/products-chart')
 */
export async function getProductsChart() {
  await simulateDelay(350)
  return mockProductSalesData
}

// =============================================
// PEDIDOS
// =============================================

/**
 * Obtiene todos los pedidos con filtros opcionales
 * TODO: Reemplazar por fetch('/api/orders?status=...&type=...')
 */
export async function getOrders(filters?: {
  status?: Order['status']
  type?: Order['type']
  dateFrom?: string
  dateTo?: string
}): Promise<Order[]> {
  await simulateDelay(400)
  
  let filteredOrders = [...mockOrders]
  
  if (filters?.status) {
    filteredOrders = filteredOrders.filter(o => o.status === filters.status)
  }
  if (filters?.type) {
    filteredOrders = filteredOrders.filter(o => o.type === filters.type)
  }
  
  return filteredOrders
}

/**
 * Obtiene un pedido por ID
 * TODO: Reemplazar por fetch('/api/orders/:id')
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  await simulateDelay(300)
  return mockOrders.find(o => o.id === orderId) || null
}

/**
 * Actualiza el estado de un pedido
 * TODO: Reemplazar por fetch('/api/orders/:id', { method: 'PATCH', body: { status } })
 */
export async function updateOrderStatus(
  orderId: string, 
  status: Order['status']
): Promise<{ success: boolean }> {
  await simulateDelay(300)
  console.log(`[Mock API] Actualizando pedido ${orderId} a estado: ${status}`)
  return { success: true }
}

/**
 * Crea un nuevo pedido
 * TODO: Reemplazar por fetch('/api/orders', { method: 'POST', body: orderData })
 */
export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  await simulateDelay(500)
  const newOrder: Order = {
    id: `ord-${Date.now()}`,
    clientId: orderData.clientId || '',
    clientName: orderData.clientName || '',
    clientPhone: orderData.clientPhone || '',
    items: orderData.items || [],
    total: orderData.total || 0,
    status: 'pending',
    type: orderData.type || 'individual',
    deliveryMethod: orderData.deliveryMethod || 'pickup',
    deliveryAddress: orderData.deliveryAddress,
    paymentMethod: orderData.paymentMethod || 'cash',
    isPaid: false,
    isUrgent: false,
    createdAt: new Date().toISOString(),
  }
  console.log('[Mock API] Nuevo pedido creado:', newOrder)
  return newOrder
}

// =============================================
// COCINA
// =============================================

/**
 * Obtiene la cola de pedidos para cocina
 * TODO: Reemplazar por fetch('/api/kitchen/queue')
 */
export async function getKitchenQueue(): Promise<Order[]> {
  await simulateDelay(350)
  return mockOrders.filter(o => 
    o.status === 'pending' || o.status === 'preparing'
  ).sort((a, b) => {
    // Urgentes primero, luego por fecha
    if (a.isUrgent && !b.isUrgent) return -1
    if (!a.isUrgent && b.isUrgent) return 1
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
}

/**
 * Marca un pedido como listo en cocina
 * TODO: Reemplazar por fetch('/api/kitchen/complete/:id', { method: 'POST' })
 */
export async function markOrderReady(orderId: string): Promise<{ success: boolean }> {
  await simulateDelay(300)
  console.log(`[Mock API] Pedido ${orderId} marcado como listo`)
  return { success: true }
}

// =============================================
// ENTREGAS / REPARTIDORES
// =============================================

/**
 * Obtiene datos de entregas
 * TODO: Reemplazar por fetch('/api/deliveries')
 */
export async function getDeliveryData(): Promise<{
  pendingDeliveries: Order[]
  inRouteDeliveries: Order[]
  completedDeliveries: Order[]
  deliveryPersons: DeliveryPerson[]
}> {
  await simulateDelay(400)
  
  const deliveryOrders = mockOrders.filter(o => o.deliveryMethod === 'delivery')
  
  return {
    pendingDeliveries: deliveryOrders.filter(o => o.status === 'ready'),
    inRouteDeliveries: deliveryOrders.filter(o => o.status === 'delivering'),
    completedDeliveries: deliveryOrders.filter(o => o.status === 'delivered'),
    deliveryPersons: mockDeliveryPersons,
  }
}

/**
 * Asigna un repartidor a un pedido
 * TODO: Reemplazar por fetch('/api/deliveries/assign', { method: 'POST', body: {...} })
 */
export async function assignDeliveryPerson(
  orderId: string, 
  deliveryPersonId: string
): Promise<{ success: boolean }> {
  await simulateDelay(300)
  console.log(`[Mock API] Repartidor ${deliveryPersonId} asignado al pedido ${orderId}`)
  return { success: true }
}

/**
 * Marca una entrega como completada
 * TODO: Reemplazar por fetch('/api/deliveries/complete/:id', { method: 'POST' })
 */
export async function completeDelivery(
  orderId: string, 
  code?: string
): Promise<{ success: boolean }> {
  await simulateDelay(300)
  console.log(`[Mock API] Entrega ${orderId} completada con código: ${code}`)
  return { success: true }
}

// =============================================
// CLIENTES
// =============================================

/**
 * Obtiene todos los clientes
 * TODO: Reemplazar por fetch('/api/clients')
 */
export async function getClients(filters?: {
  search?: string
  isFrequent?: boolean
}): Promise<Client[]> {
  await simulateDelay(400)
  
  let filteredClients = [...mockClients]
  
  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    filteredClients = filteredClients.filter(c => 
      c.name.toLowerCase().includes(searchLower) ||
      c.phone.includes(filters.search!)
    )
  }
  if (filters?.isFrequent !== undefined) {
    filteredClients = filteredClients.filter(c => c.isFrequent === filters.isFrequent)
  }
  
  return filteredClients.sort((a, b) => b.totalSpent - a.totalSpent)
}

/**
 * Obtiene un cliente por ID
 * TODO: Reemplazar por fetch('/api/clients/:id')
 */
export async function getClientById(clientId: string): Promise<Client | null> {
  await simulateDelay(300)
  return mockClients.find(c => c.id === clientId) || null
}

/**
 * Obtiene los mejores clientes
 * TODO: Reemplazar por fetch('/api/clients/top?limit=20')
 */
export async function getTopClients(limit: number = 20): Promise<Client[]> {
  await simulateDelay(350)
  return [...mockClients]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, limit)
}

// =============================================
// PRODUCTOS
// =============================================

/**
 * Obtiene todos los productos
 * TODO: Reemplazar por fetch('/api/products')
 */
export async function getProducts(): Promise<Product[]> {
  try {
    const response = await fetch('/api/products', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`Products request failed with status ${response.status}`)
    }

    return (await response.json()) as Product[]
  } catch (error) {
    console.error('Error fetching products from API, using mock data:', error)
    await simulateDelay(300)
    return mockProducts
  }
}

/**
 * Obtiene productos por categoría
 * TODO: Reemplazar por fetch('/api/products?category=...')
 */
export async function getProductsByCategory(
  category: Product['category']
): Promise<Product[]> {
  try {
    const response = await fetch(`/api/products?category=${category}`, {
      cache: 'no-store',
    })
    if (!response.ok) {
      throw new Error(`Products by category failed with status ${response.status}`)
    }

    return (await response.json()) as Product[]
  } catch (error) {
    console.error('Error fetching products by category, using mock data:', error)
    await simulateDelay(300)
    return mockProducts.filter(p => p.category === category)
  }
}

/**
 * Obtiene productos más vendidos
 * TODO: Reemplazar por fetch('/api/products/top-selling')
 */
export async function getTopSellingProducts(limit: number = 10): Promise<Product[]> {
  try {
    const response = await fetch(`/api/products?sort=top&limit=${limit}`, {
      cache: 'no-store',
    })
    if (!response.ok) {
      throw new Error(`Top products request failed with status ${response.status}`)
    }

    return (await response.json()) as Product[]
  } catch (error) {
    console.error('Error fetching top-selling products, using mock data:', error)
    await simulateDelay(300)
    return [...mockProducts]
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, limit)
  }
}

// =============================================
// CAMPAÑAS Y PROMOCIONES
// =============================================

/**
 * Obtiene todas las campañas
 * TODO: Reemplazar por fetch('/api/campaigns')
 */
export async function getCampaigns(filters?: {
  status?: Campaign['status']
}): Promise<Campaign[]> {
  await simulateDelay(400)
  
  let filteredCampaigns = [...mockCampaigns]
  
  if (filters?.status) {
    filteredCampaigns = filteredCampaigns.filter(c => c.status === filters.status)
  }
  
  return filteredCampaigns
}

/**
 * Crea una nueva campaña
 * TODO: Reemplazar por fetch('/api/campaigns', { method: 'POST', body: campaignData })
 */
export async function createCampaign(
  campaignData: Partial<Campaign>
): Promise<Campaign> {
  await simulateDelay(500)
  const newCampaign: Campaign = {
    id: `camp-${Date.now()}`,
    name: campaignData.name || '',
    description: campaignData.description || '',
    startDate: campaignData.startDate || new Date().toISOString().split('T')[0],
    endDate: campaignData.endDate || '',
    status: 'draft',
    type: campaignData.type || 'discount',
    discount: campaignData.discount,
    reachedPeople: 0,
    usedBy: 0,
    messageTemplate: campaignData.messageTemplate,
  }
  console.log('[Mock API] Nueva campaña creada:', newCampaign)
  return newCampaign
}

/**
 * Lanza una campaña por WhatsApp
 * TODO: Reemplazar por fetch('/api/campaigns/:id/launch', { method: 'POST' })
 */
export async function launchCampaign(
  campaignId: string
): Promise<{ success: boolean; sentTo: number }> {
  await simulateDelay(800)
  console.log(`[Mock API] Campaña ${campaignId} lanzada por WhatsApp`)
  return { success: true, sentTo: 150 }
}

// =============================================
// INVENTARIO
// =============================================

/**
 * Obtiene el inventario completo
 * TODO: Reemplazar por fetch('/api/inventory')
 */
export async function getInventory(): Promise<InventoryItem[]> {
  try {
    const response = await fetch('/api/inventory', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`Inventory request failed with status ${response.status}`)
    }

    const data = (await response.json()) as InventoryItem[]
    return data
  } catch (error) {
    console.error('Error fetching inventory from API, using mock data:', error)
    await simulateDelay(300)
    return mockInventory
  }
}

/**
 * Obtiene items con stock bajo
 * TODO: Reemplazar por fetch('/api/inventory/low-stock')
 */
export async function getLowStockItems(): Promise<InventoryItem[]> {
  await simulateDelay(350)
  return mockInventory.filter(i => i.isLowStock)
}

/**
 * Actualiza el stock de un item
 * TODO: Reemplazar por fetch('/api/inventory/:id', { method: 'PATCH', body: { currentStock } })
 */
export async function updateInventoryStock(
  itemId: string, 
  newStock: number
): Promise<{ success: boolean }> {
  await simulateDelay(300)
  console.log(`[Mock API] Stock de ${itemId} actualizado a: ${newStock}`)
  return { success: true }
}

// =============================================
// RESEÑAS Y OPINIONES
// =============================================

/**
 * Obtiene todas las reseñas
 * TODO: Reemplazar por fetch('/api/reviews')
 */
export async function getReviews(filters?: {
  isPositive?: boolean
  minRating?: number
}): Promise<Review[]> {
  try {
    const params = new URLSearchParams()
    if (filters?.isPositive !== undefined) {
      params.set('isPositive', String(filters.isPositive))
    }
    if (filters?.minRating) {
      params.set('minRating', String(filters.minRating))
    }

    const query = params.toString()
    const response = await fetch(`/api/reviews${query ? `?${query}` : ''}`, {
      cache: 'no-store',
    })
    if (!response.ok) {
      throw new Error(`Reviews request failed with status ${response.status}`)
    }

    return (await response.json()) as Review[]
  } catch (error) {
    console.error('Error fetching reviews from API, using mock data:', error)
    await simulateDelay(300)

    let filteredReviews = [...mockReviews]
    if (filters?.isPositive !== undefined) {
      filteredReviews = filteredReviews.filter(r => r.isPositive === filters.isPositive)
    }
    if (filters?.minRating) {
      const minRating = filters.minRating
      filteredReviews = filteredReviews.filter(r => r.productRating >= minRating)
    }

    return filteredReviews.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }
}

/**
 * Obtiene estadísticas de reseñas
 * TODO: Reemplazar por fetch('/api/reviews/stats')
 */
export async function getReviewStats(): Promise<{
  averageProductRating: number
  averageDeliveryRating: number
  totalReviews: number
  positivePercentage: number
}> {
  try {
    const response = await fetch('/api/reviews/stats', { cache: 'no-store' })
    if (!response.ok) {
      throw new Error(`Review stats failed with status ${response.status}`)
    }

    return (await response.json()) as {
      averageProductRating: number
      averageDeliveryRating: number
      totalReviews: number
      positivePercentage: number
    }
  } catch (error) {
    console.error('Error fetching review stats from API, using mock data:', error)
    await simulateDelay(300)

    const totalReviews = mockReviews.length
    const avgProduct = mockReviews.reduce((sum, r) => sum + r.productRating, 0) / totalReviews
    const avgDelivery = mockReviews.reduce((sum, r) => sum + r.deliveryRating, 0) / totalReviews
    const positive = mockReviews.filter(r => r.isPositive).length

    return {
      averageProductRating: Math.round(avgProduct * 10) / 10,
      averageDeliveryRating: Math.round(avgDelivery * 10) / 10,
      totalReviews,
      positivePercentage: Math.round((positive / totalReviews) * 100),
    }
  }
}

// =============================================
// DATOS PÚBLICOS (LANDING)
// =============================================

/**
 * Obtiene métricas públicas para la landing
 * TODO: Reemplazar por fetch('/api/public/metrics')
 */
export async function getPublicMetrics() {
  await simulateDelay(300)
  return mockPublicMetrics
}

/**
 * Obtiene productos destacados para la landing
 * TODO: Reemplazar por fetch('/api/public/featured-products')
 */
export async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const response = await fetch('/api/public/featured-products', {
      cache: 'no-store',
    })
    if (!response.ok) {
      throw new Error(`Featured products request failed with status ${response.status}`)
    }

    return (await response.json()) as Product[]
  } catch (error) {
    console.error('Error fetching featured products from API, using mock data:', error)
    await simulateDelay(300)
    return mockProducts
      .filter(p => p.category === 'empanada')
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 4)
  }
}

/**
 * Obtiene precios para eventos
 * TODO: Reemplazar por fetch('/api/public/event-pricing')
 */
export async function getEventPricing() {
  try {
    const response = await fetch('/api/public/event-pricing', {
      cache: 'no-store',
    })
    if (!response.ok) {
      throw new Error(`Event pricing request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error fetching event pricing from API, using mock data:', error)
    await simulateDelay(300)
    return mockEventPricing
  }
}

/**
 * Obtiene información del equipo
 * TODO: Reemplazar por fetch('/api/public/team')
 */
export async function getTeamMembers() {
  await simulateDelay(300)
  return mockTeamMembers
}

/**
 * Obtiene reseñas públicas positivas
 * TODO: Reemplazar por fetch('/api/public/reviews')
 */
export async function getPublicReviews(): Promise<Review[]> {
  try {
    const response = await fetch('/api/public/reviews', {
      cache: 'no-store',
    })
    if (!response.ok) {
      throw new Error(`Public reviews request failed with status ${response.status}`)
    }

    return (await response.json()) as Review[]
  } catch (error) {
    console.error('Error fetching public reviews from API, using mock data:', error)
    await simulateDelay(300)
    return mockReviews
      .filter(r => r.isPositive)
      .slice(0, 6)
  }
}

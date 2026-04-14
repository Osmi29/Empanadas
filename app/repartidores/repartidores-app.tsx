'use client'

import { useEffect, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import {
  Bell,
  Bike,
  CheckCircle2,
  ClipboardList,
  Clock3,
  CreditCard,
  MapPinned,
  MessageCircle,
  PackageCheck,
  Route,
  ShieldCheck,
  Smartphone,
  Store,
  Timer,
  Truck,
  UserPlus,
} from 'lucide-react'
import { mockOrders } from '@/data/mock-data'
import { Footer } from '@/components/landing/footer'
import { LandingHeader } from '@/components/landing/landing-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'

type VehicleType = 'moto' | 'bicicleta' | 'carro'
type Zone = 'centro' | 'norte' | 'sur'
type WorkflowStage =
  | 'waiting_pickup'
  | 'arrived_store'
  | 'picked_up'
  | 'delivering'
  | 'delivered'

interface RiderProfile {
  name: string
  phone: string
  vehicle: VehicleType
  zone: Zone
}

interface RiderOrder {
  id: string
  clientName: string
  clientPhone: string
  address: string
  items: string[]
  total: number
  payout: number
  distanceKm: number
  etaMinutes: number
  urgent: boolean
  pickupCode: string
  deliveryCode: string
  notes: string
}

interface ActiveOrder extends RiderOrder {
  stage: WorkflowStage
  acceptedAt: string
}

interface ChecklistState {
  codeVerified: boolean
  sealedBag: boolean
  drinksChecked: boolean
  extrasChecked: boolean
}

const STORAGE_KEY = 'empanadas-riders-demo'

const defaultChecklist: ChecklistState = {
  codeVerified: false,
  sealedBag: false,
  drinksChecked: false,
  extrasChecked: false,
}

const baseOrders: RiderOrder[] = mockOrders
  .filter(
    (order) =>
      order.deliveryMethod === 'delivery' &&
      ['pending', 'preparing', 'ready', 'delivering'].includes(order.status)
  )
  .map((order, index) => ({
    id: order.id,
    clientName: order.clientName,
    clientPhone: order.clientPhone,
    address: order.deliveryAddress ?? 'Direccion pendiente',
    items: order.items.map(
      (item) => `${item.quantity} x ${item.productName}`
    ),
    total: order.total,
    payout: Math.max(35, Math.round(order.total * 0.18) + index * 4),
    distanceKm: 2.4 + index * 1.3,
    etaMinutes: 12 + index * 4,
    urgent: order.isUrgent,
    pickupCode: `PK-${order.id.slice(-3).toUpperCase()}`,
    deliveryCode: `DL-${(1000 + index * 37).toString().slice(-4)}`,
    notes: order.notes ?? 'Entregar rapido y confirmar con cliente al llegar.',
  }))

const checklistItems = [
  { key: 'codeVerified', label: 'Codigo de pickup validado con cocina' },
  { key: 'sealedBag', label: 'Bolsa cerrada y sellada' },
  { key: 'drinksChecked', label: 'Bebidas y productos frios confirmados' },
  { key: 'extrasChecked', label: 'Salsas, servilletas y extras completos' },
] as const

const vehicleOptions: Array<{ value: VehicleType; label: string }> = [
  { value: 'moto', label: 'Moto' },
  { value: 'bicicleta', label: 'Bicicleta' },
  { value: 'carro', label: 'Carro' },
]

const zoneOptions: Array<{ value: Zone; label: string }> = [
  { value: 'centro', label: 'Centro' },
  { value: 'norte', label: 'Norte' },
  { value: 'sur', label: 'Sur' },
]

export function RepartidoresApp() {
  const [profile, setProfile] = useState<RiderProfile | null>(null)
  const [form, setForm] = useState<RiderProfile>({
    name: '',
    phone: '',
    vehicle: 'moto',
    zone: 'centro',
  })
  const [queue, setQueue] = useState<RiderOrder[]>(baseOrders)
  const [activeOrder, setActiveOrder] = useState<ActiveOrder | null>(null)
  const [completedOrders, setCompletedOrders] = useState<RiderOrder[]>([])
  const [checklist, setChecklist] = useState<ChecklistState>(defaultChecklist)
  const [isOnline, setIsOnline] = useState(false)
  const [deliveryCodeInput, setDeliveryCodeInput] = useState('')
  const [notice, setNotice] = useState(
    'Activa tu turno, acepta un pedido y prueba el flujo completo del rider.'
  )

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY)

    if (!saved) {
      return
    }

    try {
      const parsed = JSON.parse(saved) as {
        profile: RiderProfile | null
        queue: RiderOrder[]
        activeOrder: ActiveOrder | null
        completedOrders: RiderOrder[]
        checklist: ChecklistState
        isOnline: boolean
      }

      setProfile(parsed.profile)
      if (parsed.profile) {
        setForm(parsed.profile)
      }
      setQueue(parsed.queue?.length ? parsed.queue : baseOrders)
      setActiveOrder(parsed.activeOrder)
      setCompletedOrders(parsed.completedOrders ?? [])
      setChecklist(parsed.checklist ?? defaultChecklist)
      setIsOnline(Boolean(parsed.isOnline))
    } catch (error) {
      console.error('Unable to restore rider demo state', error)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        profile,
        queue,
        activeOrder,
        completedOrders,
        checklist,
        isOnline,
      })
    )
  }, [profile, queue, activeOrder, completedOrders, checklist, isOnline])

  const earningsToday = useMemo(
    () => completedOrders.reduce((sum, order) => sum + order.payout, 0),
    [completedOrders]
  )

  const canPickup = Object.values(checklist).every(Boolean)
  const isRegistered = Boolean(profile)

  function registerRider() {
    if (!form.name.trim() || !form.phone.trim()) {
      setNotice('Completa nombre y telefono para crear tu perfil de repartidor.')
      return
    }

    const nextProfile = {
      ...form,
      name: form.name.trim(),
      phone: form.phone.trim(),
    }

    setProfile(nextProfile)
    setNotice(
      `Perfil creado para ${nextProfile.name}. Ya puedes activar tu turno y tomar pedidos.`
    )
  }

  function acceptOrder(order: RiderOrder) {
    if (!profile) {
      setNotice('Primero registra al repartidor antes de tomar pedidos.')
      return
    }

    if (!isOnline) {
      setNotice('Activa tu turno para poder recibir y aceptar pedidos.')
      return
    }

    if (activeOrder) {
      setNotice('Solo hay un pedido activo en este demo. Termina el actual para continuar.')
      return
    }

    setQueue((current) => current.filter((item) => item.id !== order.id))
    setActiveOrder({
      ...order,
      stage: 'waiting_pickup',
      acceptedAt: new Date().toISOString(),
    })
    setChecklist(defaultChecklist)
    setDeliveryCodeInput('')
    setNotice(
      `Pedido ${order.id.toUpperCase()} aceptado. Dirigete al local y valida el pickup.`
    )
  }

  function moveToStore() {
    if (!activeOrder) {
      return
    }

    setActiveOrder({ ...activeOrder, stage: 'arrived_store' })
    setNotice('Llegaste al local. Completa el checklist antes de recoger la orden.')
  }

  function pickupOrder() {
    if (!activeOrder || !canPickup) {
      return
    }

    setActiveOrder({ ...activeOrder, stage: 'picked_up' })
    setNotice('Pickup completado. Ahora inicia la ruta hacia el cliente.')
  }

  function startDelivery() {
    if (!activeOrder) {
      return
    }

    setActiveOrder({ ...activeOrder, stage: 'delivering' })
    setNotice('Pedido en ruta. Usa el codigo de entrega cuando cierres la orden.')
  }

  function completeDelivery() {
    if (!activeOrder) {
      return
    }

    if (deliveryCodeInput.trim().toUpperCase() !== activeOrder.deliveryCode) {
      setNotice(
        `El codigo no coincide. Usa el codigo de entrega ${activeOrder.deliveryCode}.`
      )
      return
    }

    const deliveredOrder = { ...activeOrder }
    setCompletedOrders((current) => [deliveredOrder, ...current])
    setActiveOrder(null)
    setChecklist(defaultChecklist)
    setDeliveryCodeInput('')
    setNotice(
      `Entrega cerrada correctamente. Ganaste $${deliveredOrder.payout} MXN en este viaje.`
    )
  }

  function resetDemo() {
    setProfile(null)
    setForm({
      name: '',
      phone: '',
      vehicle: 'moto',
      zone: 'centro',
    })
    setQueue(baseOrders)
    setActiveOrder(null)
    setCompletedOrders([])
    setChecklist(defaultChecklist)
    setDeliveryCodeInput('')
    setIsOnline(false)
    setNotice('Demo reiniciado. Puedes volver a simular todo el flujo.')
    window.localStorage.removeItem(STORAGE_KEY)
  }

  function renderStageLabel(stage: WorkflowStage) {
    const labels: Record<WorkflowStage, string> = {
      waiting_pickup: 'En camino al local',
      arrived_store: 'En sucursal',
      picked_up: 'Pedido recogido',
      delivering: 'En ruta',
      delivered: 'Entregado',
    }

    return labels[stage]
  }

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <main className="pt-16">
        <section className="border-b border-border bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.18),_transparent_30%),linear-gradient(135deg,rgba(255,247,237,1),rgba(255,255,255,1))]">
          <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <Badge className="gap-2 rounded-full px-4 py-1.5 text-sm">
                  <Truck className="h-4 w-4" />
                  Prototipo funcional para repartidores
                </Badge>
                <h1 className="mt-5 max-w-3xl text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                  Ahora si: una app para registrar riders, tomar pedidos y cerrar entregas
                </h1>
                <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
                  Esta vista ya funciona como producto demo. Puedes registrar un
                  repartidor, activar turno, ver pedidos, aceptar uno, completar el
                  checklist de pickup, salir a ruta y confirmar la entrega.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Button
                    variant={isOnline ? 'secondary' : 'default'}
                    onClick={() => {
                      if (!profile) {
                        setNotice('Primero registra un repartidor antes de abrir turno.')
                        return
                      }

                      setIsOnline((current) => !current)
                      setNotice(
                        !isOnline
                          ? 'Turno activo. Ya puedes aceptar pedidos.'
                          : 'Turno pausado. No se aceptaran pedidos nuevos.'
                      )
                    }}
                  >
                    {isOnline ? 'Pausar turno' : 'Activar turno'}
                  </Button>
                  <Button variant="outline" onClick={resetDemo}>
                    Reiniciar demo
                  </Button>
                </div>
              </div>

              <Card className="border-primary/15 bg-card/90">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Estado del simulador
                  </CardTitle>
                  <CardDescription>
                    Todo se guarda localmente en el navegador para que puedas seguir
                    probando aunque recargues la pagina.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 text-sm leading-6 text-foreground">
                    {notice}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <MiniStat
                      label="Pedidos disponibles"
                      value={queue.length.toString()}
                      icon={PackageCheck}
                    />
                    <MiniStat
                      label="Pedidos completados"
                      value={completedOrders.length.toString()}
                      icon={CheckCircle2}
                    />
                    <MiniStat
                      label="Ganancia del turno"
                      value={`$${earningsToday}`}
                      icon={CreditCard}
                    />
                    <MiniStat
                      label="Turno"
                      value={isOnline ? 'En linea' : 'Pausado'}
                      icon={Timer}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 xl:grid-cols-[0.8fr_1.1fr_0.9fr]">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="h-5 w-5 text-primary" />
                  Registro del rider
                </CardTitle>
                <CardDescription>
                  Simula el onboarding que despues puedes guardar en MongoDB.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Nombre</label>
                  <Input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                    placeholder="Ej. Juan Perez"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Telefono</label>
                  <Input
                    value={form.phone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        phone: event.target.value,
                      }))
                    }
                    placeholder="6561234567"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Vehiculo</label>
                  <select
                    value={form.vehicle}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        vehicle: event.target.value as VehicleType,
                      }))
                    }
                    className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                  >
                    {vehicleOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Zona</label>
                  <select
                    value={form.zone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        zone: event.target.value as Zone,
                      }))
                    }
                    className="border-input bg-background h-10 w-full rounded-md border px-3 text-sm"
                  >
                    {zoneOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <Button className="w-full" onClick={registerRider}>
                  Guardar perfil del repartidor
                </Button>

                {profile && (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-emerald-800">
                      <ShieldCheck className="h-4 w-4" />
                      <span className="text-sm font-semibold">Perfil listo</span>
                    </div>
                    <div className="mt-3 space-y-2 text-sm text-emerald-900">
                      <p>{profile.name}</p>
                      <p>{profile.phone}</p>
                      <p>
                        {vehicleOptions.find((option) => option.value === profile.vehicle)?.label}
                        {' · '}
                        {zoneOptions.find((option) => option.value === profile.zone)?.label}
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  Pedido activo y flujo de trabajo
                </CardTitle>
                <CardDescription>
                  Aqui vive el proceso real: aceptar, llegar, revisar, recoger y entregar.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {!activeOrder ? (
                  <div className="rounded-3xl border border-dashed border-border p-8 text-center">
                    <Store className="mx-auto h-10 w-10 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">No hay pedido activo</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Toma uno de la cola de pedidos para probar el flujo del rider.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="rounded-3xl border border-border bg-muted/40 p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-semibold">{activeOrder.id.toUpperCase()}</h3>
                            {activeOrder.urgent && (
                              <Badge variant="destructive">Urgente</Badge>
                            )}
                          </div>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {activeOrder.clientName} · {activeOrder.clientPhone}
                          </p>
                        </div>
                        <Badge variant="secondary">{renderStageLabel(activeOrder.stage)}</Badge>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        <InfoPill icon={MapPinned} label="Destino" value={activeOrder.address} />
                        <InfoPill
                          icon={Clock3}
                          label="ETA estimado"
                          value={`${activeOrder.etaMinutes} min`}
                        />
                        <InfoPill
                          icon={CreditCard}
                          label="Ganancia"
                          value={`$${activeOrder.payout} MXN`}
                        />
                        <InfoPill
                          icon={Route}
                          label="Distancia"
                          value={`${activeOrder.distanceKm.toFixed(1)} km`}
                        />
                      </div>
                      <div className="mt-4 rounded-2xl bg-background p-4">
                        <p className="text-sm font-medium">Pedido</p>
                        <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                          {activeOrder.items.map((item) => (
                            <li key={item}>- {item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <WorkflowStep
                        title="1. Llegar al local"
                        description="Simula la llegada del rider al punto de pickup."
                        completed={activeOrder.stage !== 'waiting_pickup'}
                        actionLabel="Ya llegue a sucursal"
                        disabled={activeOrder.stage !== 'waiting_pickup'}
                        onAction={moveToStore}
                      />

                      <Card className="border-border/80">
                        <CardHeader className="pb-0">
                          <CardTitle className="text-base">
                            2. Checklist de recoleccion
                          </CardTitle>
                          <CardDescription>
                            No se puede recoger hasta validar los puntos clave.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-4">
                          <div className="rounded-2xl border border-primary/10 bg-primary/5 p-3 text-sm">
                            Codigo para recoger: <strong>{activeOrder.pickupCode}</strong>
                          </div>
                          {checklistItems.map((item) => (
                            <label
                              key={item.key}
                              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3"
                            >
                              <Checkbox
                                checked={checklist[item.key]}
                                disabled={activeOrder.stage !== 'arrived_store'}
                                onCheckedChange={(checked) =>
                                  setChecklist((current) => ({
                                    ...current,
                                    [item.key]: Boolean(checked),
                                  }))
                                }
                              />
                              <span className="text-sm">{item.label}</span>
                            </label>
                          ))}
                          <Button
                            className="w-full"
                            disabled={activeOrder.stage !== 'arrived_store' || !canPickup}
                            onClick={pickupOrder}
                          >
                            Confirmar pickup
                          </Button>
                        </CardContent>
                      </Card>

                      <WorkflowStep
                        title="3. Salir a ruta"
                        description="Despues del pickup el rider puede iniciar el recorrido."
                        completed={['delivering', 'delivered'].includes(activeOrder.stage)}
                        actionLabel="Iniciar entrega"
                        disabled={activeOrder.stage !== 'picked_up'}
                        onAction={startDelivery}
                      />

                      <Card className="border-border/80">
                        <CardHeader className="pb-0">
                          <CardTitle className="text-base">4. Cerrar entrega</CardTitle>
                          <CardDescription>
                            Usa el codigo del cliente para marcar la orden como entregada.
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
                            Codigo de entrega demo: <strong>{activeOrder.deliveryCode}</strong>
                          </div>
                          <Input
                            value={deliveryCodeInput}
                            onChange={(event) => setDeliveryCodeInput(event.target.value)}
                            disabled={activeOrder.stage !== 'delivering'}
                            placeholder="Escribe el codigo del cliente"
                          />
                          <Button
                            className="w-full"
                            disabled={activeOrder.stage !== 'delivering'}
                            onClick={completeDelivery}
                          >
                            Marcar como entregado
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-primary" />
                    Pedidos disponibles
                  </CardTitle>
                  <CardDescription>
                    Asi se verian las ofertas que le llegan al rider.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {queue.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                      No hay pedidos pendientes en este demo.
                    </div>
                  ) : (
                    queue.map((order) => (
                      <div
                        key={order.id}
                        className="rounded-2xl border border-border p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold">{order.id.toUpperCase()}</p>
                              {order.urgent && (
                                <Badge variant="destructive">Urgente</Badge>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {order.clientName}
                            </p>
                          </div>
                          <Badge variant="outline">${order.payout}</Badge>
                        </div>
                        <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <MapPinned className="h-4 w-4" />
                            <span>{order.address}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Route className="h-4 w-4" />
                            <span>
                              {order.distanceKm.toFixed(1)} km · {order.etaMinutes} min
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <PackageCheck className="h-4 w-4" />
                            <span>{order.items.length} renglones en la orden</span>
                          </div>
                        </div>
                        <Button
                          className="mt-4 w-full"
                          disabled={!isRegistered || !isOnline || Boolean(activeOrder)}
                          onClick={() => acceptOrder(order)}
                        >
                          Aceptar pedido
                        </Button>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smartphone className="h-5 w-5 text-primary" />
                    Lo que ya puedes enseñar al cliente o al socio
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <SupportRow icon={Bike} text="Registro visual del repartidor con perfil base" />
                  <SupportRow icon={Bell} text="Activacion y pausa de turno" />
                  <SupportRow icon={Store} text="Cola de pedidos disponibles para aceptar" />
                  <SupportRow icon={ClipboardList} text="Checklist de pickup antes de salir" />
                  <SupportRow icon={Route} text="Cambio de estados hasta entrega" />
                  <SupportRow
                    icon={MessageCircle}
                    text="Base lista para luego conectar chat, mapas y notificaciones"
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}

function MiniStat({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

function InfoPill({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>
  label: string
  value: string
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span className="text-xs uppercase tracking-[0.2em]">{label}</span>
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function WorkflowStep({
  title,
  description,
  completed,
  actionLabel,
  disabled,
  onAction,
}: {
  title: string
  description: string
  completed: boolean
  actionLabel: string
  disabled: boolean
  onAction: () => void
}) {
  return (
    <Card className={completed ? 'border-emerald-200 bg-emerald-50/70' : ''}>
      <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{title}</h3>
            {completed && <Badge className="bg-emerald-600">Listo</Badge>}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        <Button disabled={disabled} onClick={onAction}>
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  )
}

function SupportRow({
  icon: Icon,
  text,
}: {
  icon: ComponentType<{ className?: string }>
  text: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border p-4">
      <Icon className="mt-0.5 h-4 w-4 text-primary" />
      <p>{text}</p>
    </div>
  )
}

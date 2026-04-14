import type { Metadata } from 'next'
import { RepartidoresApp } from '@/app/repartidores/repartidores-app'

export const metadata: Metadata = {
  title: 'App de Repartidores | Empanadas JRZ',
  description:
    'Prototipo funcional para repartidores con registro, turnos, pedidos, pickup y entrega usando estado local.',
}

export default function RepartidoresPage() {
  return <RepartidoresApp />
}

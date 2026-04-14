'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft, Menu, MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const homeNavLinks = [
  { href: '#servicios', label: 'Servicios' },
  { href: '#productos', label: 'Productos' },
  { href: '#eventos', label: 'Eventos' },
  { href: '#equipo', label: 'Equipo' },
  { href: '#opiniones', label: 'Opiniones' },
  { href: '/repartidores', label: 'Repartidores' },
]

const driverNavLinks = [
  { href: '/#servicios', label: 'Menú' },
  { href: '#flujo', label: 'Flujo' },
  { href: '#ingresos', label: 'Ganancias' },
  { href: '#requisitos', label: 'Requisitos' },
  { href: '#faq', label: 'FAQ' },
]

const WHATSAPP_NUMBER = '526561234567' // TODO: Reemplazar con numero real
const WHATSAPP_ORDER_MESSAGE = encodeURIComponent(
  'Hola, quiero hacer un pedido de empanadas'
)
const WHATSAPP_DRIVER_MESSAGE = encodeURIComponent(
  'Hola, quiero registrarme como repartidor de Empanadas JRZ'
)

export function LandingHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const isDriverPage = pathname === '/repartidores'
  const navLinks = isDriverPage ? driverNavLinks : homeNavLinks
  const whatsappMessage = isDriverPage
    ? WHATSAPP_DRIVER_MESSAGE
    : WHATSAPP_ORDER_MESSAGE

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-primary-foreground">E</span>
          </div>
          <span className="text-lg font-bold text-foreground">
            Empanadas<span className="text-primary">JRZ</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isDriverPage && (
            <Button asChild variant="outline" className="gap-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
          )}
          <Button asChild className="gap-2">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <MessageCircle className="h-4 w-4" />
              {isDriverPage ? 'Aplicar ahora' : 'Ordenar ahora'}
            </a>
          </Button>
        </div>

        <button
          type="button"
          className="inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className="sr-only">Abrir menu</span>
          {isMobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 border-t border-border pt-4">
              {isDriverPage && (
                <Button asChild variant="outline" className="mb-3 w-full gap-2">
                  <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                    <ArrowLeft className="h-4 w-4" />
                    Volver al inicio
                  </Link>
                </Button>
              )}
              <Button asChild className="w-full gap-2">
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="h-4 w-4" />
                  {isDriverPage ? 'Aplicar ahora' : 'Ordenar ahora'}
                </a>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}

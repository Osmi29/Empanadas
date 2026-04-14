'use client'

import Link from 'next/link'
import { Facebook, Instagram, MessageCircle } from 'lucide-react'

const WHATSAPP_NUMBER = '526561234567'

const socialLinks = [
  { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  {
    icon: MessageCircle,
    href: `https://wa.me/${WHATSAPP_NUMBER}`,
    label: 'WhatsApp',
  },
]

const footerLinks = {
  productos: [
    { label: 'Empanada de Carne', href: '/#productos' },
    { label: 'Empanada de Pollo', href: '/#productos' },
    { label: 'Empanada Mixta', href: '/#productos' },
    { label: 'Empanada Vegetariana', href: '/#productos' },
  ],
  servicios: [
    { label: 'Pedidos Individuales', href: '/#servicios' },
    { label: 'Pedidos para Eventos', href: '/#eventos' },
    { label: 'Cotizaciones', href: '/#eventos' },
    { label: 'Portal para Repartidores', href: '/repartidores' },
  ],
  contacto: [
    { label: 'WhatsApp', href: `https://wa.me/${WHATSAPP_NUMBER}` },
    { label: 'Ciudad Juarez, Chihuahua', href: '#' },
    { label: 'info@empanadas.mx', href: 'mailto:info@empanadas.mx' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <span className="text-lg font-bold text-primary-foreground">E</span>
              </div>
              <span className="text-lg font-bold text-foreground">
                Empanadas<span className="text-primary">JRZ</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">
              Las mejores empanadas colombianas en Ciudad Juarez. Hechas con amor y
              la receta tradicional de la abuela.
            </p>
            <div className="mt-6 flex gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    <Icon className="h-5 w-5" />
                    <span className="sr-only">{social.label}</span>
                  </a>
                )
              })}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3 lg:col-span-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Productos</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.productos.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Servicios</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.servicios.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Contacto</h3>
              <ul className="mt-4 space-y-3">
                {footerLinks.contacto.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Empanadas JRZ. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}

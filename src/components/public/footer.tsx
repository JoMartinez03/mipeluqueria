import Link from 'next/link'
import { Scissors } from 'lucide-react'

export function PublicFooter() {
  return (
    <footer className="gradient-sidebar mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15">
              <Scissors className="h-4 w-4 text-white" strokeWidth={1.8} />
            </span>
            <span className="text-sm font-semibold text-white">MiPeluqueria</span>
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/60">
            <Link href="/#como-funciona" className="transition-colors hover:text-white">
              Cómo funciona
            </Link>
            <Link href="/register" className="transition-colors hover:text-white">
              Crear mi negocio
            </Link>
            <Link href="/login" className="transition-colors hover:text-white">
              Iniciar sesión
            </Link>
          </nav>
        </div>
        <div className="mt-8 border-t border-white/10 pt-6 text-center text-xs text-white/40">
          © {new Date().getFullYear()} MiPeluqueria · Hecho para peluqueros y barberos
        </div>
      </div>
    </footer>
  )
}
import Link from 'next/link'
import { Scissors } from 'lucide-react'

const PRODUCT = [
  { label: 'Funciones', href: '#funciones' },
  { label: 'Para tus clientes', href: '#clientes' },
]

const LINK_CLASS = 'text-zinc-300 transition-colors duration-200 hover:text-teal-300'

export function PublicFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-[#070b10] text-zinc-400">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-400/50 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-28 left-1/2 h-56 w-[42rem] max-w-full -translate-x-1/2 rounded-full bg-teal-500/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_repeat(4,minmax(0,1fr))]">
          <div>
            <Link href="/" className="group inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-105">
                <Scissors className="h-4.5 w-4.5" strokeWidth={2} />
              </span>
              <span className="text-lg font-bold text-white">MiPeluqueria</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
              Turnos online para tu peluquería o barbería. Sin líos, sin planillas, sin perder
              clientes.
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Producto</div>
            <ul className="mt-4 space-y-3 text-sm">
              {PRODUCT.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className={LINK_CLASS}>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Cuenta</div>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/login" className={LINK_CLASS}>
                  Ingresar
                </Link>
              </li>
              <li>
                <Link href="/register" className={LINK_CLASS}>
                  Crear cuenta
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Ayuda</div>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <a href="#pasos" className={LINK_CLASS}>
                  Cómo funciona
                </a>
              </li>
              <li>
                <Link href="/register" className={LINK_CLASS}>
                  Crear mi negocio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-400">Legal</div>
            <ul className="mt-4 space-y-3 text-sm text-zinc-400">
              <li>Términos de uso</li>
              <li>Política de privacidad</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/5 pt-6 text-xs text-zinc-400 sm:flex-row">
          <span>© {new Date().getFullYear()} MiPeluqueria. Todos los derechos reservados.</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
            Hecho para peluquerías y barberías
          </span>
        </div>
      </div>
    </footer>
  )
}
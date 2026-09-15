import Link from 'next/link'
import { Scissors } from 'lucide-react'

const PRODUCT = [
  { label: 'Funciones', href: '#funciones' },
  { label: 'Para tus clientes', href: '#clientes' },
  { label: 'Cómo funciona', href: '#pasos' },
]

export function PublicFooter() {
  return (
    <footer className="border-t bg-[#0b1218] text-zinc-300">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Scissors className="h-4.5 w-4.5" strokeWidth={2} />
              </span>
              <span className="text-lg font-bold text-white">MiPeluqueria</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
              Turnos online para tu peluquería o barbería. Sin líos, sin planillas, sin perder clientes.
            </p>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Producto</div>
            <ul className="mt-4 space-y-3 text-sm">
              {PRODUCT.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-zinc-400 transition-colors hover:text-white">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Acceso</div>
            <ul className="mt-4 space-y-3 text-sm">
              <li>
                <Link href="/login" className="text-zinc-400 transition-colors hover:text-white">
                  Ingresar
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-zinc-400 transition-colors hover:text-white">
                  Crear mi negocio
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-zinc-500">Legal</div>
            <ul className="mt-4 space-y-3 text-sm text-zinc-400">
              <li>Términos de uso</li>
              <li>Política de privacidad</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-zinc-500 sm:flex-row">
          <span>© {new Date().getFullYear()} MiPeluqueria. Todos los derechos reservados.</span>
          <span>Hecho para peluquerías y barberías.</span>
        </div>
      </div>
    </footer>
  )
}
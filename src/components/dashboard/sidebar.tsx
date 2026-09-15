'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Scissors,
  Clock,
  Settings,
  LogOut,
  ChevronsUpDown,
  Scissors as ScissorsLogo,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarMenuBadge,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '', label: 'Inicio', icon: LayoutDashboard, exact: true },
  { href: '/turnos', label: 'Turnos', icon: CalendarDays },
  { href: '/servicios', label: 'Servicios', icon: Scissors },
  { href: '/horarios', label: 'Horarios', icon: Clock },
  { href: '/configuracion', label: 'Configuración', icon: Settings },
]

function isActive(pathname: string, href: string, exact?: boolean) {
  const base = pathname.split('/').slice(0, 3).join('/')
  if (exact) return pathname === base || pathname === `${base}/`
  return pathname === `${base}${href}` || pathname.startsWith(`${base}${href}/`)
}

export function AppSidebar({
  slug,
  barbershopName,
  userName,
  todayCount,
  logo,
}: {
  slug: string
  barbershopName: string
  userName: string
  todayCount?: number
  logo?: string | null
}) {
  const pathname = usePathname()
  const { setOpenMobile } = useSidebar()

  const handleSignOut = () => {
    void signOut({ callbackUrl: '/' })
  }

  return (
    <Sidebar className="gradient-sidebar" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[active=true]:bg-transparent">
              <div className="flex items-center gap-2 px-1">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 ring-1 ring-white/15">
                  {logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logo} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ScissorsLogo className="h-4.5 w-4.5 text-white" strokeWidth={1.8} />
                  )}
                </div>
                <div className="grid flex-1 leading-tight">
                  <span className="truncate text-sm font-semibold text-sidebar-foreground">
                    {barbershopName}
                  </span>
                  <span className="truncate text-xs text-sidebar-foreground/60">
                    MiPeluqueria
                  </span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Panel de gestión</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map((item) => {
              const active = isActive(pathname, item.href, item.exact)
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    render={<Link href={`/dashboard/${slug}${item.href}`} />}
                    isActive={active}
                    onClick={() => setOpenMobile(false)}
                    tooltip={item.label}
                  >
                    <item.icon className="h-4 w-4" strokeWidth={1.8} />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.label === 'Turnos' && todayCount !== undefined && todayCount > 0 && (
                    <SidebarMenuBadge className="bg-primary/25 text-teal-200 ring-1 ring-primary/30 font-semibold text-xs">
                      {todayCount}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator className="bg-white/10" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-white/5 data-[active=true]:bg-white/5"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/15 text-xs font-bold text-white uppercase">
                {userName.slice(0, 2)}
              </div>
              <div className="grid flex-1 leading-tight text-left">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  {userName}
                </span>
                <span className="truncate text-xs text-sidebar-foreground/60">Peluquero/a</span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4 text-sidebar-foreground/40" />
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              className="hover:bg-red-500/10 hover:text-red-300 text-sidebar-foreground/70"
              tooltip="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.8} />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

export function DashboardPageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function MobileHeader({
  barbershopName,
  userName,
  logo,
}: {
  barbershopName: string
  userName: string
  logo?: string | null
}) {
  const { toggleSidebar } = useSidebar()
  return (
    <header className="flex items-center justify-between border-b bg-card px-4 py-3 md:hidden">
      <button onClick={toggleSidebar} className="rounded-lg p-1.5 text-foreground hover:bg-accent" aria-label="Abrir menú">
        <MenuIcon className="h-5 w-5" />
      </button>
      <div className="flex items-center gap-2">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logo} alt="" className="h-5 w-5 rounded object-cover" />
        ) : (
          <ScissorsLogo className="h-4 w-4" />
        )}
        <span className="text-sm font-semibold">{barbershopName}</span>
      </div>
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-bold uppercase">
        {userName.slice(0, 2)}
      </div>
    </header>
  )
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn(className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}
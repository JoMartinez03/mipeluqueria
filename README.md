# Mi Peluquería

Sistema web de reservas para peluquerías/barberías: página pública por local, reservas en línea, dashboard con turnos, servicios, horarios y configuración.

## Empezar

### Modo desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000).

### Modo producción

```bash
npm run build
npm start
```

Por defecto sirve en [http://localhost:3000](http://localhost:3000). Para usar otro puerto:

```bash
npx next start -p 3100
# → http://localhost:3100
```

## Variables de entorno

Se cargan desde `.env` y `.env.local` (ya presentes). Requeridas:

| Variable | Descripción |
| --- | --- |
| `DATABASE_URL` | Cadena de conexión PostgreSQL (Neon). Ej. `postgresql://user:pass@host/neondb?sslmode=require&channel_binding=require` |
| `AUTH_SECRET` | Secreto para cifrar las sesiones de Auth.js |
| `AUTH_TRUST_HOST` | `"true"` para aceptar el host en desarrollo local |

## Usuario y peluquería de prueba

Ya existe en la base (Neon) una peluquería creada durante el desarrollo:

- **Email:** `barber@test.local` — **Contraseña:** `test1234`
- **Peluquería:** "Barber San Ra" — slug `barber-san-ra`

Rutas para probarla:

- Página pública: [http://localhost:3000/barber-san-ra](http://localhost:3000/barber-san-ra)
- Reserva: [http://localhost:3000/barber-san-ra/reservar](http://localhost:3000/barber-san-ra/reservar)
- Dashboard: [http://localhost:3000/dashboard/barber-san-ra](http://localhost:3000/dashboard/barber-san-ra) (requiere iniciar sesión en [/login](http://localhost:3000/login))
- Landing + buscador: [http://localhost:3000](http://localhost:3000)

## Registrar una peluquería nueva

1. Ir a [http://localhost:3000/register](http://localhost:3000/register) y completar:
   - Nombre, email, contraseña (mínimo 6 caracteres)
   - Nombre de la peluquería
   - Slug (solo minúsculas, números y guiones; ej. `mi-peluqueria`)
2. Al registrarte quedás como propietario (OWNER) de esa peluquería y podés iniciar sesión en `/login`.

Alternativa por API: `POST /api/register` con JSON `{ name, email, password, barbershopName, slug }`.

## Smoke tests pendientes

Pendiente para una etapa posterior (por ahora se prueba manualmente en el navegador):

- Registro de usuario + peluquería
- Autenticación (login/logout) y sesión
- Creación de servicios
- Configuración de horarios (business hours) y excepciones
- Consulta de `available-slots`
- Reserva (creación, conflicto 409 por horario ocupado, cancelación)
- Dashboard (turnos, servicios, horarios, configuración)
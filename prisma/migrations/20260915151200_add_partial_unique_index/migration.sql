-- Índice único parcial: impide turnos duplicados SOLO para turnos activos
-- Un turno CANCELLED libera el horario para una nueva reserva.
-- Protección a nivel de base de datos contra race conditions (dos clientes reservando el mismo slot).
CREATE UNIQUE INDEX "Appointment_barbershopId_startAt_active_idx"
ON "Appointment" ("barbershopId", "startAt")
WHERE "status" != 'CANCELLED';
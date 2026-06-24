/** Maps error.detail (English) → Spanish. Primary mapping while backend doesn't expose code in body. */
export const DETAIL_TO_ES: Record<string, string> = {
  'Invalid credentials.': 'Correo o contraseña incorrectos.',
  'Authentication required.': 'Se requiere iniciar sesión.',
  'Not enough seats available.': 'No hay suficientes asientos disponibles.',
  'Event is not active.': 'El evento no está activo.',
  'Only active events can be cancelled.': 'Solo se pueden cancelar eventos activos.',
  'Reservation is already confirmed.': 'La reserva ya está confirmada.',
  'Only confirmed reservations can be cancelled.': 'Solo se pueden cancelar reservas confirmadas.',
  'You can only cancel your own reservations.': 'Solo puede cancelar sus propias reservas.',
  'Reservation is cancelled.': 'La reserva ya está cancelada.',
  'Reservation not found.': 'La reserva no fue encontrada.',
  'Event not found.': 'El evento no fue encontrado.',
  'Venue not found.': 'El recinto no existe.',
  'Venue schedule overlaps with another event.': 'El recinto ya está reservado para esas fechas.',
  'Capacity cannot exceed venue capacity.': 'La capacidad no puede superar la del recinto.',
  'Capacity must be greater than zero.': 'La capacidad debe ser mayor a cero.',
  'Title must be between 5 and 100 characters.': 'El título debe tener entre 5 y 100 caracteres.',
  'Description must be between 10 and 500 characters.':
    'La descripción debe tener entre 10 y 500 caracteres.',
  'Start must be in the future.': 'La fecha de inicio debe ser en el futuro.',
  'Weekend events cannot start after 22:00.':
    'Los eventos de fin de semana no pueden comenzar después de las 22:00.',
  'End must be after start.': 'La fecha de fin debe ser posterior a la de inicio.',
  'Amount must be greater than zero.': 'El precio debe ser mayor a cero.',
  'Email format is invalid.': 'El formato del correo no es válido.',
  'Reservations are closed within 1 hour of the event start.':
    'Las reservas cierran 1 hora antes del inicio del evento.',
  'Maximum 5 seats within 24 hours of the event.':
    'Máximo 5 asientos en las 24 horas previas al evento.',
  'Maximum 10 seats for high-price events.': 'Máximo 10 asientos para eventos de alto precio.',
  'At least one seat must be reserved.': 'Debe reservar al menos un asiento.',
  'Could not generate a unique reservation code.':
    'No se pudo generar el código de reserva. Intente nuevamente.',
  'An unexpected error occurred.': 'Ocurrió un error inesperado.',
  'An unexpected error occurred': 'Ocurrió un error inesperado.',
};

/** Maps error code → Spanish (active once Plan B1 adds code to the body). */
export const CODE_TO_ES: Record<string, string> = {
  'auth.invalidCredentials': 'Correo o contraseña incorrectos.',
  'auth.unauthenticated': 'Se requiere iniciar sesión.',
  'event.notFound': 'El evento no fue encontrado.',
  'event.notActive': 'El evento no está activo.',
  'event.venueOverlap': 'El recinto ya está reservado para esas fechas.',
  'event.capacity.exceedsVenue': 'La capacidad no puede superar la del recinto.',
  'event.capacity.exceeded': 'No hay suficientes asientos disponibles.',
  'event.capacity.invalid': 'La capacidad debe ser mayor a cero.',
  'event.start.past': 'La fecha de inicio debe ser en el futuro.',
  'event.start.weekendNight': 'Los eventos de fin de semana no pueden comenzar después de las 22:00.',
  'event.title.length': 'El título debe tener entre 5 y 100 caracteres.',
  'event.description.length': 'La descripción debe tener entre 10 y 500 caracteres.',
  'venue.notFound': 'El recinto no existe.',
  'reserve.tooLate': 'Las reservas cierran 1 hora antes del inicio del evento.',
  'reserve.max5Near24h': 'Máximo 5 asientos en las 24 horas previas al evento.',
  'reserve.max10HighPrice': 'Máximo 10 asientos para eventos de alto precio.',
  'reserve.soldOut': 'No hay suficientes asientos disponibles.',
  'reserve.minQuantity': 'Debe reservar al menos un asiento.',
  'reservation.notFound': 'La reserva no fue encontrada.',
  'reservation.alreadyConfirmed': 'La reserva ya está confirmada.',
  'reservation.notConfirmed': 'Solo se pueden cancelar reservas confirmadas.',
  'reservation.cancelled': 'La reserva ya está cancelada.',
  'reservation.forbidden': 'Solo puede cancelar sus propias reservas.',
  'reservation.codeCollision': 'No se pudo generar el código de reserva. Intente nuevamente.',
  'concurrency.conflict': 'Conflicto: el recurso fue modificado. Intente nuevamente.',
  'DateRange.InvalidRange': 'La fecha de fin debe ser posterior a la de inicio.',
  'money.invalidAmount': 'El precio debe ser mayor a cero.',
  'Email.InvalidFormat': 'El formato del correo no es válido.',
};

const STATUS_TO_ES: Record<number, string> = {
  400: 'Los datos enviados son inválidos.',
  401: 'Sesión expirada. Inicie sesión nuevamente.',
  403: 'No tiene permisos para realizar esta acción.',
  404: 'El recurso no fue encontrado.',
  409: 'Conflicto: el recurso fue modificado. Intente nuevamente.',
  422: 'Los datos no cumplen las reglas del sistema.',
  500: 'Error interno del servidor.',
};

export function mapErrorToSpanish(
  detail?: string,
  code?: string,
  status?: number,
): string {
  if (code && CODE_TO_ES[code]) return CODE_TO_ES[code];
  if (detail && DETAIL_TO_ES[detail]) return DETAIL_TO_ES[detail];
  if (detail) return detail; // unknown detail → show as-is (e.g. field validation messages)
  if (status && STATUS_TO_ES[status]) return STATUS_TO_ES[status];
  return 'Ocurrió un error inesperado.';
}

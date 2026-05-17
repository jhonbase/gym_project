// ID del trainer principal (desde variables de entorno)
export const DEFAULT_TRAINER_ID = process.env.EXPO_PUBLIC_DEFAULT_TRAINER_ID || ''

export const TRAINER_STATUS = {
  DISPONIBLE: 'DISPONIBLE',
  OCUPADO: 'OCUPADO',
  NO_DISPONIBLE: 'NO_DISPONIBLE',
}

export const STATUS_COLORS = {
  DISPONIBLE: '#22c55e',
  OCUPADO: '#eab308',
  NO_DISPONIBLE: '#ef4444',
}

export const STATUS_LABELS = {
  DISPONIBLE: '🟢 Disponible',
  OCUPADO: '🟡 Ocupado',
  NO_DISPONIBLE: '🔴 No disponible',
}
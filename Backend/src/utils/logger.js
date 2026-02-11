export function info(message) {
  console.log(`[${new Date().toISOString()}] INFO: ${message}`)
}

export function warn(message) {
  console.warn(`[${new Date().toISOString()}] WARN: ${message}`)
}

export function error(message) {
  console.error(`[${new Date().toISOString()}] ERROR: ${message}`)
}

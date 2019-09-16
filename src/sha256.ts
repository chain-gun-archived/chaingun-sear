import { Buffer, TextEncoder, subtle } from './shims'

export async function sha256(input: string, name = 'SHA-256') {
  const hash = await subtle.digest({ name }, new TextEncoder().encode(input))
  return Buffer.from(hash)
}

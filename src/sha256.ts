import { Buffer, TextEncoder, crypto } from './shims'

export async function sha256(input: string, name = 'SHA-256') {
  const inp = typeof input === 'string' ? input : JSON.stringify(input)
  const encoded = new TextEncoder().encode(inp)
  const hash = await crypto.subtle.digest({ name }, encoded)
  return Buffer.from(hash)
}

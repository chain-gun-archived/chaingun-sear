import { random, crypto } from './shims'
import { sha256 } from './sha256'
import { keyToJwk } from './settings'

const DEFAULT_OPTS = {
  name: 'AES-GCM'
} as {
  name?: string
}

export async function importAesKey(key: string, salt: Buffer, opt = DEFAULT_OPTS) {
  const combo = key + (salt || random(8)).toString('utf8')
  const hash = await sha256(combo)
  const jwkKey = keyToJwk(hash)
  return crypto.subtle.importKey('jwk', jwkKey, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

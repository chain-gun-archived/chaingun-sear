import { subtle, random } from './shims'
import { sha256 } from './sha256'

const DEFAULT_OPTS = {
  name: 'AES-GCM'
} as {
  name?: string
}

export async function importAesKey(key: string, salt: Buffer, opt = DEFAULT_OPTS) {
  const combo = key + (salt || random(8)).toString('utf8')
  const hash = await sha256(combo)
  return subtle.importKey(
    'raw',
    Buffer ? Buffer.from(hash) : new Uint8Array(hash),
    opt.name || DEFAULT_OPTS.name,
    false,
    ['encrypt', 'decrypt']
  )
}

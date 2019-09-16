import { Buffer, subtle, random } from './shims'
import { sha256 } from './sha256'

const DEFAULT_OPTS = {
  name: 'AES_GCM'
} as {
  name?: string
}

export async function importAesKey(key: string, salt: Buffer, opt = DEFAULT_OPTS) {
  const combo = key + (salt || random(9)).toString('utf8')
  const hash = Buffer.from(await sha256(combo), 'binary')
  return subtle.importKey('raw', new Uint8Array(hash), opt.name || DEFAULT_OPTS.name, false, [
    'encrypt',
    'decrypt'
  ])
}

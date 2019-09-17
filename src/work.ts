import { pbkdf2 } from './settings'
import { subtle, TextEncoder, Buffer } from './shims'

const DEFAULT_OPTS = {
  name: 'PBKDF2',
  encode: 'base64',
  hash: pbkdf2.hash
} as {
  name?: string
  iterations?: number
  hash?: string
  encode?: string
  length?: number
}

export async function work(data: string, salt: string, opt = DEFAULT_OPTS) {
  var key = await subtle.importKey(
    'raw',
    new TextEncoder().encode(data),
    { name: opt.name || DEFAULT_OPTS.name },
    false,
    ['deriveBits']
  )
  var work = await subtle.deriveBits(
    {
      name: opt.name || 'PBKDF2',
      iterations: opt.iterations || pbkdf2.iter,
      salt: new TextEncoder().encode(salt),
      hash: opt.hash || DEFAULT_OPTS.hash
    },
    key,
    opt.length || pbkdf2.ks * 8
  )
  return Buffer.from(work, 'binary').toString(opt.encode || DEFAULT_OPTS.encode)
}

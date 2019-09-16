import { pbkdf2 } from './settings'
import { subtle, TextEncoder, Buffer } from './shims'

const DEFAULT_OPTS = {} as {
  name?: string
  iterations?: number
  hash?: Function
  encode?: string
  length?: number
}

export async function work(data: string, salt: string, opt = DEFAULT_OPTS) {
  var key = await subtle.importKey(
    'raw',
    new TextEncoder().encode(data),
    { name: opt.name || 'PBKDF2' },
    false,
    ['deriveBits']
  )
  var work = await subtle.deriveBits(
    {
      name: opt.name || 'PBKDF2',
      iterations: opt.iterations || pbkdf2.iter,
      salt: new TextEncoder().encode(salt),
      hash: opt.hash || pbkdf2.hash
    },
    key,
    opt.length || pbkdf2.ks * 8
  )
  return Buffer.from(work, 'binary').toString(opt.encode || 'base64')
}

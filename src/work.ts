import { pbkdf2 } from './settings'
import { TextEncoder, Buffer, crypto } from './shims'

const DEFAULT_OPTS = {
  name: 'PBKDF2',
  encode: 'base64',
  hash: pbkdf2.hash
}

export async function work(
  data: string,
  salt: string,
  opt: {
    name?: string
    iterations?: number
    hash?: { name: string }
    encode?: string
    length?: number
  } = DEFAULT_OPTS
) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(data),
    { name: opt.name || DEFAULT_OPTS.name || '' },
    false,
    ['deriveBits']
  )
  const work = await crypto.subtle.deriveBits(
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

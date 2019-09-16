import { parse, ecdsa, jwk } from './settings'
import { subtle } from './shims'
import { sha256 } from './sha256'

const DEFAULT_OPTS = {
  encode: 'base64'
} as {
  fallback?: boolean
  encode?: string
  raw?: boolean
  check?: {
    m: any
    s: string
  }
}

function importKey(pub: string) {
  const token = jwk(pub)
  const promise = subtle.importKey('jwk', token, ecdsa.pair, false, ['verify'])
  return promise
}

export async function verify(data: string, pub: string, opt = DEFAULT_OPTS) {
  const encoding = opt.encode || DEFAULT_OPTS.encode
  const json = parse(data)
  const key = await importKey(pub)
  const hash = await sha256(typeof json.m === 'string' ? json.m : JSON.stringify(json.m))
  const buf = Buffer.from(json.s, encoding)
  const sig = new Uint8Array(buf)

  if (await subtle.verify(ecdsa.sign, key, sig, new Uint8Array(hash))) return true
  if (opt.fallback) return oldVerify(data, pub, opt)
  return false
}

export async function oldVerify(data: string, pub: string, opt = DEFAULT_OPTS) {
  throw new Error('Legacy fallback validation not yet supported')
}

import { parse, ecdsa, jwk } from './settings'
import { crypto } from './shims'
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
  const promise = crypto.subtle.importKey('jwk', token, ecdsa.pair, false, ['verify'])
  return promise
}

export async function verifyHashSignature(
  hash: string,
  signature: string,
  pub: string,
  opt = DEFAULT_OPTS
) {
  const encoding = opt.encode || DEFAULT_OPTS.encode
  const key = await importKey(pub)
  const buf = Buffer.from(signature, encoding)
  const sig = new Uint8Array(buf)

  if (await crypto.subtle.verify(ecdsa.sign, key, sig, new Uint8Array(Buffer.from(hash, 'hex')))) {
    return true
  }

  return false
}

export async function verifySignature(
  text: string,
  signature: string,
  pub: string,
  opt = DEFAULT_OPTS
) {
  const encoding = opt.encode || DEFAULT_OPTS.encode
  const key = await importKey(pub)
  const hash = await sha256(typeof text === 'string' ? text : JSON.stringify(text))
  return verifyHashSignature(hash.toString('hex'), signature, pub, opt)
}

export async function verify(
  data: string | { m: string; s: string },
  pub: string,
  opt = DEFAULT_OPTS
) {
  const json = parse(data)
  if (await verifySignature(json.m, json.s, pub, opt)) return true
  if (opt.fallback) return oldVerify(data, pub, opt)
  return false
}

export async function oldVerify(
  data: string | { m: string; s: string },
  pub: string,
  opt = DEFAULT_OPTS
) {
  throw new Error('Legacy fallback validation not yet supported')
}

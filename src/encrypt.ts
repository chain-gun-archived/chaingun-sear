import { subtle, random, Buffer, TextEncoder } from './shims'
import { importAesKey } from './importAesKey'

const DEFAULT_OPTS = {
  name: 'AES-GCM',
  encode: 'base64'
} as {
  name?: string
  encode?: string
  raw?: boolean
}

export async function encrypt(msg: string, key: string, opt = DEFAULT_OPTS) {
  const rand = { s: random(9), iv: random(15) } // consider making this 9 and 15 or 18 or 12 to reduce == padding.

  const ct = await subtle.encrypt(
    {
      name: opt.name || DEFAULT_OPTS.name,
      iv: new Uint8Array(rand.iv)
    },
    await importAesKey(key, rand.s, opt),
    new TextEncoder().encode(msg)
  )
  const encoding = opt.encode || DEFAULT_OPTS.encode
  const r = {
    ct: Buffer.from(ct, 'binary').toString(encoding),
    iv: rand.iv.toString(encoding),
    s: rand.s.toString(encoding)
  }
  if (opt.raw) return r
  return 'SEA' + JSON.stringify(r)
}

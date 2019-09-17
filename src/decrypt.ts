import { parse } from './settings'
import { importAesKey } from './importAesKey'
import { subtle, Buffer, TextDecoder } from './shims'

const DEFAULT_OPTS = {
  name: 'AES-GCM',
  encode: 'base64'
} as {
  name?: string
  encode?: string
  fallback?: string
}

export async function decrypt(data: string, key: string, opt = DEFAULT_OPTS): Promise<GunValue> {
  const json = parse(data)
  const encoding = opt.encode || DEFAULT_OPTS.encode

  try {
    const aeskey = await importAesKey(key, Buffer.from(json.s, encoding), opt)
    const encrypted = new Uint8Array(Buffer.from(json.ct, encoding))
    const iv = new Uint8Array(Buffer.from(json.iv, encoding))
    const ct = await subtle.decrypt(
      {
        name: opt.name || DEFAULT_OPTS.name,
        iv
      },
      aeskey,
      encrypted
    )
    return parse(new TextDecoder('utf8').decode(ct))
  } catch (e) {
    console.warn('decrypt error', e, e.stack || e)
    if (!opt.fallback || encoding === opt.fallback) throw 'Could not decrypt'
    return decrypt(data, key, { ...opt, encode: opt.fallback })
  }
}

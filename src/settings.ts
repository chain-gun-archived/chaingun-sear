export const shuffleAttackCutoff = 1546329600000 // Jan 1, 2019

export const pbkdf2 = { hash: { name: 'SHA-256' }, iter: 100000, ks: 64 }
export const ecdsa = {
  pair: { name: 'ECDSA', namedCurve: 'P-256' },
  sign: { name: 'ECDSA', hash: { name: 'SHA-256' } }
}
export const ecdh = { name: 'ECDH', namedCurve: 'P-256' }

// This creates Web Cryptography API compliant JWK for sign/verify purposes
export const jwk = function(pub: string, d?: any) {
  // d === priv
  const coords = pub.split('.')
  return {
    kty: 'EC',
    crv: 'P-256',
    x: coords[0],
    y: coords[1],
    ext: true,
    d,
    key_opts: d ? ['sign'] : ['verify']
  }
}

export function keyToJwk(keyBytes: Buffer) {
  const keyB64 = keyBytes.toString('base64')
  const k = keyB64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/\=/g, '')
  return { kty: 'oct', k: k, ext: false, alg: 'A256GCM' }
}

export function check(t: any) {
  return typeof t === 'string' && 'SEA{' === t.slice(0, 4)
}

export function parse(t: any) {
  try {
    const yes = typeof t == 'string'
    if (yes && 'SEA{' === t.slice(0, 4)) {
      t = t.slice(3)
    }
    return yes ? JSON.parse(t) : t
  } catch {}
  return t
}

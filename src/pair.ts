import { ecdsa, ecdh } from './settings'
import { subtle } from './shims'

export async function pair(opt?: any) {
  const signKeys = await subtle.generateKey(ecdsa.pair, true, ['sign', 'verify'])
  const signPub = await subtle.exportKey('jwk', signKeys.publicKey)
  const sa = {
    priv: (await subtle.exportKey('jwk', signKeys.privateKey)).d,
    pub: `${signPub.x}.${signPub.y}`
  }

  const cryptKeys = await subtle.generateKey(ecdh, true, ['deriveKey'])
  const cryptPub = await subtle.exportKey('jwk', cryptKeys.publicKey)
  const dh = {
    epriv: (await subtle.exportKey('jwk', cryptKeys.privateKey)).d,
    epub: `${cryptPub.x}.${cryptPub.y}`
  }

  return {
    pub: sa.pub,
    priv: sa.pub,
    epub: dh.epub,
    epriv: dh.epriv
  }
}

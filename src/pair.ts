import { ecdsa, ecdh } from './settings'
import { crypto } from './shims'

export async function pair(opt?: any) {
  const signKeys = await crypto.subtle.generateKey(ecdsa.pair, true, ['sign', 'verify'])
  const signPub = await crypto.subtle.exportKey('jwk', signKeys.publicKey)
  const sa = {
    priv: (await crypto.subtle.exportKey('jwk', signKeys.privateKey)).d,
    pub: `${signPub.x}.${signPub.y}`
  }

  const cryptKeys = await crypto.subtle.generateKey(ecdh, true, ['deriveKey'])
  const cryptPub = await crypto.subtle.exportKey('jwk', cryptKeys.publicKey)
  const dh = {
    epriv: (await crypto.subtle.exportKey('jwk', cryptKeys.privateKey)).d,
    epub: `${cryptPub.x}.${cryptPub.y}`
  }

  return {
    pub: sa.pub,
    priv: sa.priv || '',
    epub: dh.epub,
    epriv: dh.epriv || ''
  }
}

export const Buffer = require('./SafeBuffer')

const api: any = {
  Buffer,
  crypto: (window && (window.crypto || (window as any).msCrypto)) || {},
  TextEncoder: window && window.TextEncoder,
  TextDecoder: window && window.TextDecoder
}
api.subtle = api.crypto && (api.crypto.subtle || api.crypto.webkitSubtle)
api.random = (len: number) =>
  api.Buffer.from(api.crypto.getRandomValues(new Uint8Array(api.Buffer.alloc(len))))

if (!api.subtle) {
  const WebCrypto = require('node-webcrypto-ossl')
  const { TextEncoder, TextDecoder } = require('text-encoding')
  api.crypto = require('crypto')
  api.TextEncoder = TextEncoder
  api.TextDecoder = TextDecoder
  api.subtle = new WebCrypto({ directory: 'ossl' }).subtle // ECDH
  api.random = (len: number) => api.Buffer.from(api.crypto.randomBytes(len))
}

export const TextEncoder = api.TextEncoder
export const TextDecoder = api.TextDecoder
export const crypto = api.crypto
export const subtle = api.subtle
export const random = api.random

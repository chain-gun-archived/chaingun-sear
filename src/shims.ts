import './base64'
import SafeBuffer from './SafeBuffer'
import root from 'window-or-global'

const isocrypto = require('isomorphic-webcrypto')

export const crypto = isocrypto.default || isocrypto

export const Buffer = SafeBuffer

const api: any = {
  Buffer,
  TextEncoder: root && root.TextEncoder,
  TextDecoder: root && root.TextDecoder
}
api.random = (len: number) =>
  api.Buffer.from(isocrypto.getRandomValues(new Uint8Array(api.Buffer.alloc(len))))
// api.random = (len: number) => api.Buffer.from(api.crypto.randomBytes(len))

if (!api.TextEncoder) {
  // tslint:disable-next-line: no-eval
  const { TextEncoder, TextDecoder } = eval('require')('text-encoding')
  api.TextEncoder = TextEncoder
  api.TextDecoder = TextDecoder
}

export const TextEncoder = api.TextEncoder
export const TextDecoder = api.TextDecoder
export const random = api.random

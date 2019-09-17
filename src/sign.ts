import { parse, check, jwk, ecdsa } from './settings'
import { sha256 } from './sha256'
import { subtle, Buffer } from './shims'
import { verify } from './verify'
import { pubFromSoul } from './soul'

const DEFAULT_OPTS = {
  encode: 'base64'
} as {
  encode?: string
  raw?: boolean
  check?: {
    m: any
    s: string
  }
}

export function prep(val: any, key: string, node: GunNode, soul: string) {
  // prep for signing
  return {
    '#': soul,
    '.': key,
    ':': val,
    '>': node && node._ && node._['>'] && node._['>'][key]
  }
}

export async function hashForSignature(text: string) {
  return (await sha256(JSON.stringify(parse(text)))).toString('hex')
}

export function hashNodeKey(node: GunNode, key: string) {
  const val = node && node[key]
  const parsed = parse(val)
  const soul = node && node._ && node._['#']
  const prepped = prep(parsed, key, node, soul)
  return hashForSignature(parse(prepped))
}

export async function signHash(
  hash: string,
  pair: { pub: string; priv: string },
  encoding = DEFAULT_OPTS.encode
) {
  const { pub, priv } = pair
  const token = jwk(pub, priv)
  const signKey = subtle.importKey('jwk', token, ecdsa.pair, false, ['sign'])
  const sig = await subtle.sign(ecdsa.sign, signKey, new Uint8Array(Buffer.from(hash, 'hex')))
  return Buffer.from(sig, 'binary').toString(encoding)
}

export async function sign(data: string, pair: { pub: string; priv: string }, opt = DEFAULT_OPTS) {
  if (typeof data === 'undefined') throw new Error('`undefined` not allowed.')
  const json = parse(data)
  const encoding = opt.encode || DEFAULT_OPTS.encode
  const checkData = (opt.check = opt.check || json)

  if (
    (check(checkData) || (checkData && checkData.s && checkData.m)) &&
    (await verify(data, pair.pub))
  ) {
    // already signed
    const r = parse(checkData)
    if (opt.raw) return r
    return 'SEA' + JSON.stringify(r)
  }

  const hash = await hashForSignature(data)
  const sig = await signHash(hash, pair, encoding)
  const r = {
    m: json,
    s: Buffer.from(sig, 'binary').toString(encoding)
  }
  if (opt.raw) return r
  return 'SEA' + JSON.stringify(r)
}

export async function signNodeValue(
  node: GunNode,
  key: string,
  pair: { pub: string; priv: string },
  encoding = DEFAULT_OPTS.encode
) {
  const hash = await hashNodeKey(node, key)
  const sig = await signHash(hash, pair)
  return {
    m: parse(node[key]),
    s: Buffer.from(sig, 'binary').toString(encoding)
  }
}

export async function signNode(
  node: GunNode,
  pair: { pub: string; priv: string },
  encoding = DEFAULT_OPTS.encode
) {
  const signedNode: GunNode = {
    _: node._
  }
  for (let key in node) {
    if (key === '_') continue
    signedNode[key] = JSON.stringify(await signNodeValue(node, key, pair, encoding))
  }
  return signedNode
}

export async function signGraph(
  graph: GunGraphData,
  pair: { pub: string; priv: string },
  encoding = DEFAULT_OPTS.encode
) {
  const modifiedGraph = { ...graph }
  for (let soul in graph) {
    const soulPub = pubFromSoul(soul)
    if (soulPub !== pair.pub) continue
    const node = graph[soul]
    if (!node) continue
    modifiedGraph[soul] = await signNode(node, pair, encoding)
  }
  return modifiedGraph
}

export function graphSigner(pair: { pub: string; priv: string }, encoding = DEFAULT_OPTS.encode) {
  return function(graph: GunGraphData) {
    return signGraph(graph, pair, encoding)
  }
}

import { parse, jwk, ecdsa } from './settings'
import { sha256 } from './sha256'
import { crypto } from './shims'

import { Buffer } from './shims'
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
    ':': parse(val),
    '>': node && node._ && node._['>'] && node._['>'][key]
  }
}

export async function hashForSignature(prepped: any) {
  const hash = await sha256(typeof prepped === 'string' ? prepped : JSON.stringify(prepped))
  return hash.toString('hex')
}

export function hashNodeKey(node: GunNode, key: string) {
  const val = node && node[key]
  const parsed = parse(val)
  const soul = node && node._ && node._['#']
  const prepped = prep(parsed, key, node, soul)
  return hashForSignature(prepped)
}

export async function signHash(
  hash: string,
  pair: { pub: string; priv: string },
  encoding = DEFAULT_OPTS.encode
) {
  const { pub, priv } = pair
  const token = jwk(pub, priv)
  const signKey = await crypto.subtle.importKey('jwk', token, ecdsa.pair, false, ['sign'])
  const sig = await crypto.subtle.sign(
    ecdsa.sign,
    signKey,
    new Uint8Array(Buffer.from(hash, 'hex'))
  )
  try {
    const res = Buffer.from(sig, 'binary').toString(encoding)
    return res
  } catch (e) {
    console.error(e.stack || e)
  }
}

export async function sign(data: string, pair: { pub: string; priv: string }, opt = DEFAULT_OPTS) {
  if (typeof data === 'undefined') throw new Error('`undefined` not allowed.')
  const json = parse(data)
  const encoding = opt.encode || DEFAULT_OPTS.encode
  const checkData = (opt.check = opt.check || json)

  if (json && ((json.s && json.m) || (json[':'] && json['~'])) && (await verify(data, pair.pub))) {
    // already signed
    const r = parse(checkData)
    if (opt.raw) return r
    return 'SEA' + JSON.stringify(r)
  }

  const hash = await hashForSignature(data)
  const sig = await signHash(hash, pair, encoding)
  const r = {
    m: json,
    s: sig
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
  const data = node[key]
  const json = parse(data)

  if (data && json && ((json.s && json.m) || (json[':'] && json['~']))) {
    // already signed
    return json
  }

  const hash = await hashNodeKey(node, key)
  const sig = await signHash(hash, pair)
  return {
    ':': parse(node[key]),
    '~': sig
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
  const soul = node._ && node._['#']

  for (let key in node) {
    if (key === '_') continue
    if (key === 'pub' /*|| key === "alias"*/ && soul === `~${pair.pub}`) {
      // Special case
      signedNode[key] = node[key]
      continue
    }
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

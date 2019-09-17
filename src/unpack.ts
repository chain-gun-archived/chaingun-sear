import { parse, check, shuffleAttackCutoff } from './settings'

export function unpack(value: any, key: string, node: GunNode) {
  if (!value) return
  if (typeof value === 'object' && ':' in value) {
    const val = value[':']
    if (typeof val !== 'undefined') return val
  }
  if (!key || !node) return
  if (value === node[key]) return value
  if (!check(node[key])) return value
  const soul = node && node._ && node._['#']
  const state = node && node._ && node._['>'] && node._['>'][key]
  if (
    value &&
    4 === value.length &&
    soul === value[0] &&
    key === value[1] &&
    Math.floor(state) === Math.floor(value[3])
  ) {
    return value[2]
  }
  if (state < shuffleAttackCutoff) return value
}

export function unpackNode(node: GunNode) {
  if (!node) return node

  const result: GunNode = {
    _: node._
  }

  for (let key in node) {
    if (key === '_') continue
    result[key] = unpack(parse(node[key]), key, node)
  }

  return result
}

export function unpackGraph(graph: GunGraphData) {
  const unpackedGraph: GunGraphData = {}
  for (let soul in graph) {
    const node = graph[soul]
    unpackedGraph[soul] = node ? unpackNode(node) : node
  }

  return unpackedGraph
}

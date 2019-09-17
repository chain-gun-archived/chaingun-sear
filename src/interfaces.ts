interface GunNodeState {
  [key: string]: number
}

interface GunNode {
  _: {
    '#': string
    '>': GunNodeState
  }
  [key: string]: GunValue
}

interface GunGraphData {
  [key: string]: GunNode | undefined
}

interface GunMsg {
  '#'?: string
  '##'?: string | number

  get?: {
    '#': string
  }

  put?: {
    [soul: string]: GunNode
  }
}

type GunValue = object | string | number | boolean | null

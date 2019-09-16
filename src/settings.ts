export const shuffleAttackCutoff = 1546329600000 // Jan 1, 2019

export function check(t: any) {
  return typeof t === 'string' && 'SEA{' === t.slice(0, 4)
}

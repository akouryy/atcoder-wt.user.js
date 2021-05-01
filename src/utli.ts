export const times = (n: number): number[] => [...Array(n).keys()]

export const last = <T>(arr: readonly T[]): T => arr[arr.length - 1]

export const iSplice = <T>(ts: readonly T[], start: number, delCnt: number, ...items: T[]): T[] => {
  const ret = [...ts]
  ret.splice(start, delCnt, ...items)
  return ret
}

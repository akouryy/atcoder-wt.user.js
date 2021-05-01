export const times = (n: number): number[] => [...Array(n).keys()]

export const last = <T>(arr: readonly T[]): T => arr[arr.length - 1]

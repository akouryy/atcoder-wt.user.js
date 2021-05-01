import Peg from 'pegjs'
import syntax from './Ten.pegjs'
import { last, times } from './utli'

type Part =
  { type: 'INT', name: string, diff: number } |
  { type: 'STR', name: string } |
  { type: 'SEQ', parts: Part[] } |
  { type: 'ITER', count: string, body: Part }

const TenParser = Peg.generate(syntax)

function counter(depth: number): string {
  return `TeN${depth}`
}

function typeStr(base: string, dim: number): string {
  return ('vec<'.repeat(dim) + base + '>'.repeat(dim))
    .replace(/vec<(bool|char|int|double|string)>/g, (_, t: string) => `V${t[0].toUpperCase()}`)
    .replace(/vec<V([A-Z])>/g, 'W$1')
}

function indices(dim: number): string {
  return times(dim).map((_, i) => `[${counter(i)}]`).join('')
}

function toCPP(part0: Part): string {
  let defCode = ''
  const dims = new Map<string, number>()

  function toCPPRec(
    part: Part, reps: readonly string[],
    resizeRequests: readonly string[][], codes: readonly string[][], /* 中の1次元配列は書込可 */
  ): void {
    switch (part.type) {
      case 'INT': case 'STR': {
        const d = reps.length
        const hasFixedSize = d > 0 && reps.every((r) => !dims.get(r))
        const baseType = part.type === 'INT' ? 'int' : 'string'

        dims.set(part.name, d)
        const indexed = part.name + indices(d)
        last(codes).push(`cin>>${indexed};`)

        if (part.type === 'INT' && part.diff !== 0) {
          last(codes).push(`${indexed}+=${part.diff};`)
        }

        if (hasFixedSize) {
          codes[0].push(`${typeStr(baseType, d)} ${part.name}(`)
          for (const e of times(d - 1)) {
            codes[0].push(`${reps[e]},${typeStr(baseType, d - 1 - e)}(`)
          }
          codes[0].push(`${reps[d - 1] + ')'.repeat(d)};`)
        } else {
          defCode += `${typeStr(baseType, d)} ${part.name};`
          for (const vs of resizeRequests) {
            vs.push(part.name)
          }
        }

        break
      }
      case 'SEQ':
        part.parts.forEach((p) => toCPPRec(p, reps, resizeRequests, codes))
        break
      case 'ITER': {
        const currentResizeReq = Array<string>()
        const currentCode = Array<string>()
        toCPPRec(
          part.body, [...reps, part.count], [...resizeRequests, currentResizeReq],
          [...codes, currentCode],
        )
        const d = reps.length
        const countIndexed = part.count + indices(dims.get(part.count) ?? 0)
        for (const req of currentResizeReq) {
          last(codes).push(`${req}${indices(d)}.resize(${countIndexed});`)
        }
        last(codes).push(`times(${countIndexed},${counter(d)}){${currentCode.join('')}}`)
        break
      }
      default:
    }
  }

  const codes0 = [['']]
  toCPPRec(part0, [], [], codes0)
  return defCode + codes0[0].join('')
}

export function parseTen(code: string): string {
  try {
    const p = TenParser.parse(code) as Part
    return `/* wt.ten: ${code} */\n${toCPP(p)}`
  } catch (e) {
    if (e instanceof Error) { // if (e instanceof Peg.SyntaxError) {
      // eslint-disable-next-line no-console
      console.error(e)
      return `${code}\n${e.message}`
    }
    throw e
  }
}

import Peg from 'pegjs'
import syntax from './Ten.pegjs'
import { iSplice, last, times } from './utli'

const MAX_LEN = 110

type Part =
  { type: 'INT', name: string, diff: number } |
  { type: 'FLOAT', name: string, diff: number } |
  { type: 'CHAR', name: string } |
  { type: 'STR', name: string } |
  { type: 'SEQ', parts: Part[] } |
  { type: 'ITER', count: string, body: Part }

type CPPStmt =
  { type: 'DECLARE', cppType: string, vars: string[] } |
  { type: 'INPUT', terms: string[] } |
  { type: 'ADD', term: string, diff: number } |
  { type: 'RESIZE', term: string, size: string } |
  { type: 'TIMES', num: string, counter: string, body: readonly CPPStmt[] }

const TenParser = Peg.generate(syntax)

function counter(depth: number): string {
  return `i${depth}`
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
  const defCode = Array<CPPStmt>()
  const dims = new Map<string, number>()

  function toCPPRec(
    part: Part, reps: readonly string[],
    resizeRequests: readonly string[][], codes: readonly CPPStmt[][], /* 中の1次元配列は書込可 */
  ): void {
    switch (part.type) {
      case 'INT': case 'FLOAT': case 'CHAR': case 'STR': {
        const d = reps.length
        const hasFixedSize = d > 0 && reps.every((r) => !dims.get(r))
        const baseType =
          part.type === 'INT'
            ? 'int'
            : part.type === 'FLOAT'
              ? 'double'
              : part.type === 'CHAR' ? 'char' : 'string'

        dims.set(part.name, d)
        const indexed = part.name + indices(d)
        last(codes).push({ type: 'INPUT', terms: [indexed] })

        if ((part.type === 'INT' || part.type === 'FLOAT') && part.diff !== 0) {
          last(codes).push({ type: 'ADD', term: indexed, diff: part.diff })
        }

        if (hasFixedSize) {
          let decl = `${part.name}(`
          for (const e of times(d - 1)) {
            decl += `${reps[e]},${typeStr(baseType, d - 1 - e)}(`
          }
          decl += `${reps[d - 1] + ')'.repeat(d)}`

          codes[0].push({ type: 'DECLARE', cppType: typeStr(baseType, d), vars: [decl] })
        } else {
          defCode.push({ type: 'DECLARE', cppType: typeStr(baseType, d), vars: [part.name] })
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
        const currentCode = Array<CPPStmt>()
        const isRaw = part.count[0] === '['
        const count = isRaw ? part.count.slice(1, -1) : part.count
        toCPPRec(
          part.body, [...reps, count], [...resizeRequests, currentResizeReq],
          [...codes, currentCode],
        )
        const d = reps.length
        const countIndexed = isRaw ? count : count + indices(dims.get(count) ?? 0)
        for (const req of currentResizeReq) {
          last(codes).push({ type: 'RESIZE', term: `${req}${indices(d)}`, size: countIndexed })
        }
        last(codes).push({ type: 'TIMES', num: countIndexed, counter: counter(d), body: currentCode })
        break
      }
      default:
        throw new Error(`Cannot CPPify AST ${JSON.stringify(part)}`)
    }
  }

  const codes0 = [Array<CPPStmt>()]
  toCPPRec(part0, [], [], codes0)
  return cppStmtToString([...defCode, ...codes0[0]])
}

function cppStmtToString(stmts0: readonly CPPStmt[]): string {
  const lines = ['']

  function add(text: string): void {
    if (last(lines).length + text.length >= MAX_LEN) {
      lines.push(text)
    } else {
      lines[lines.length - 1] += text
    }
  }

  function rec(stmts: readonly CPPStmt[], i: number): void {
    if (i >= stmts.length) { return }

    const stmt = stmts[i]
    switch (stmt.type) {
      case 'DECLARE': {
        const next = stmts[i + 1]
        if (next?.type === 'DECLARE' && next.cppType === stmt.cppType) {
          rec(iSplice(stmts, i, 2, { ...stmt, vars: [...stmt.vars, ...next.vars] }), i)
          return
        }
        add(`${stmt.cppType} ${stmt.vars.join(',')};`)
        break
      }
      case 'INPUT': {
        let j = i + 1
        while (stmts[j]?.type === 'ADD') { ++j }

        const next = stmts[j]
        if (next?.type === 'INPUT') {
          rec(iSplice(
            iSplice(stmts, j, 1), i, 1, { ...stmt, terms: [...stmt.terms, ...next.terms] },
          ), i)
          return
        }
        add(`cin>>${stmt.terms.join('>>')};`)
        break
      }
      case 'ADD':
        if (stmt.diff === 1) {
          add(`++${stmt.term};`)
        } else if (stmt.diff === -1) {
          add(`--${stmt.term};`)
        } else if (stmt.diff > 0) {
          add(`${stmt.term}+=${stmt.diff};`)
        } else if (stmt.diff < 0) {
          add(`${stmt.term}-=${-stmt.diff};`)
        }
        break
      case 'RESIZE':
        add(`${stmt.term}.resize(${stmt.size});`)
        break
      case 'TIMES':
        add(`times(${stmt.num},${stmt.counter}){`)
        rec(stmt.body, 0)
        add('}')
        break
      default:
        throw new Error(`Cannot stringify CPPStmt ${JSON.stringify(stmt)}`)
    }
    rec(stmts, i + 1)
  }

  rec(stmts0, 0)
  return lines.map((l) => `  ${l}\n`).join('')
}

export function parseTen(code: string): string {
  try {
    const p = TenParser.parse(code) as Part
    return `/* wt.ten: ${code.trim()} */\n${toCPP(p)}`
  } catch (e) {
    if (e instanceof Error) { // if (e instanceof Peg.SyntaxError) {
      // eslint-disable-next-line no-console
      console.error(e)
      return `${code}\n${e.message}`
    }
    throw e
  }
}

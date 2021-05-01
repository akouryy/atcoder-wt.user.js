SEQ
  = _ head:TERM tail:(___ TERM)* _ {
      return { type: 'SEQ', parts: [head, ...tail.map(t => t[1])] }
    }

TERM
  = ITER
  / INT
  / STR
  / '(' _ seq:SEQ _ ')' {
      return seq
    }

ITER
  = count:IDENT body:TERM {
      return { type: 'ITER', count, body }
    }

INT
  = name:IDENT diff:INT_diff? {
      return {
        type: 'INT',
        name,
        diff: diff ?? 0,
      }
    }

STR
  = '"' name:IDENT {
      return { type: 'STR', name }
    }

INT_diff
  = sign:("+" / "-") lit:NATURAL_LIT? {
      return (sign === '+' ? 1 : -1) * (lit ?? 1)
    }

IDENT
  = [A-Z][a-z]* {
      return text()
    }

NATURAL_LIT
  = [0-9]+ {
      return parseInt(text(), 10)
    }

_   = [ \t\r\n]*
___ = [ \t\r\n]+

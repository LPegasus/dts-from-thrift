const ThriftType2JavascriptType: { [key: string]: string } = {
  bool: 'boolean',
  byte: 'number',
  i16: 'number',
  i32: 'number',
  i64: 'Int64',
  double: 'number',
  string: 'string',
  binary: 'any',
  list: 'Array',
  map: 'Map',
  set: 'Set'
};

export function typeMapping(str: string) {
  const tokens: string[] = [];
  let ch: string;
  let token = '';
  let i = 0;
  const len = str.length;
  while (true) {
    ch = str.charAt(i);
    if (/[\s\b\<>,]/.test(ch)) {
      token = ThriftType2JavascriptType[token] || token;
      tokens.push(...[token, ch].filter(Boolean));
      token = '';
    } else {
      token += ch;
    }
    i++;
    if (i >= len) {
      if (token) {
        token = ThriftType2JavascriptType[token] || token;
        tokens.push(token)
      }
      break;
    }
  }

  const rtn = tokens.join('').replace(/Array<([^<>|]+)>/g, '$1[]');

  return rtn;
}

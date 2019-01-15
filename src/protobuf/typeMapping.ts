const pb2JavascriptType: { [key: string]: string } = {
  double: 'number',
  float: 'number',
  int32: 'number',
  int64: 'number',
  uint32: 'number',
  uint64: 'number',
  sint32: 'number',
  sint64: 'number',
  fixed32: 'number',
  fixed64: 'number',
  sfixed32: 'number',
  sfixed64: 'number',
  bool: 'boolean',
  bytes: 'Buffer | number[] | Uint8Array',
  string: 'string',
  list: 'Array',
  map: 'Map'
};

const typeReplaceRegexp = new RegExp(
  `[\\W\\D]?(${Object.keys(pb2JavascriptType).join('|')})[\\W\\D]?`,
  'g'
);

export function typeMapping(s: string, isRepeated: boolean = false) {
  let str = s;
  // 如果标记了 repeated，则给类型套一个 list 让后续程序处理成 array
  if (isRepeated) {
    str = `list<${s}>`;
  }
  const tokens: string[] = [];
  let ch: string;
  let token = '';
  let i = 0;
  const len = str.length;
  while (true) {
    ch = str.charAt(i);
    if (/[\s\b\<>,]/.test(ch)) {
      token = pb2JavascriptType[token] || token;
      tokens.push(...[token, ch].filter(Boolean));
      token = '';
    } else {
      token += ch;
    }
    i++;
    if (i >= len) {
      if (token) {
        token = pb2JavascriptType[token] || token;
        tokens.push(token);
      }
      break;
    }
  }

  const rtn = tokens.join('').replace(/Array<([^<>|]+)>/g, '$1[]');

  return rtn;
}

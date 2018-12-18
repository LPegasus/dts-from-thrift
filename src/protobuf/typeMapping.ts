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
  string: 'string'
};

const typeReplaceRegexp = new RegExp(
  `[\\W\\D]?(${Object.keys(pb2JavascriptType).join('|')})[\\W\\D]?`,
  'g'
);

export function typeMapping(str: string, isRepeated: boolean = false) {
  let rtn = str;
  // 如果标记了 repeated，则给类型套一个 list 让后续程序处理成 array
  if (isRepeated) {
    rtn = `list<${str}>`;
  }
  rtn = rtn
    .replace(/(map|list)</g, (_k, v) => {
      if (v === 'list') {
        return 'Array<';
      }
      return v.substr(0, 1).toUpperCase() + v.substr(1) + '<';
    })
    .replace(/[\W\D]?Array<([\w\d_.]+)>[\W\D]?/g, (k, v) => {
      return k.replace(`Array<${v}>`, `${v}[]`);
    })
    .replace(typeReplaceRegexp, (k, v) => {
      const type = pb2JavascriptType[v] || v;
      return k.replace(v, type);
    });
  return rtn;
}

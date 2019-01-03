const ThriftType2JavascriptType: { [key: string]: string } = {
  bool: 'boolean',
  byte: 'number',
  i16: 'number',
  i32: 'number',
  i64: 'Int64',
  double: 'number',
  string: 'string',
  binary: 'any'
};

const typeReplaceRegexp = new RegExp(
  `[\\W\\D]?(${Object.keys(ThriftType2JavascriptType).join('|')})[\\W\\D]?`,
  'g'
);

export function typeMapping(str: string) {
  let rtn = str
    .replace(/(set|map|list)</g, (_k, v) => {
      if (v === 'list') {
        return 'Array<';
      }
      return v.substr(0, 1).toUpperCase() + v.substr(1) + '<';
    })
    .replace(/[\W\D]?Array<([\w\d_.]+)>[\W\D]?/g, (k, v) => {
      return k.replace(`Array<${v}>`, `${v}[]`);
    })
    .replace(typeReplaceRegexp, (k, v) => {
      const type = ThriftType2JavascriptType[v];
      return k.replace(v, type);
    });

  return rtn;
}

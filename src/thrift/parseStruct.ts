import { typeMapping } from './typeMapping';
import {
  InterfaceEntity,
  InterfacePropertyEntity,
  CMDOptions
} from '../interfaces';

export function parseStruct(
  codes: string[],
  options: Partial<CMDOptions> = {}
): InterfaceEntity {
  const name = /^struct\s+([\w\d_]+)(?:\s+)?{/.exec(codes[0].trim())![1];
  const properties: { [key: string]: InterfacePropertyEntity } = {};
  const propertyLines = codes
    .map(d => d.trim())
    .filter(d => !!d)
    .slice(1, codes.length - 1);

  for (let i = 0; i < propertyLines.length; i++) {
    const line = propertyLines[i].trim();
    const [index, ...rest] = line.split(':').map(d => d.trim());
    let partialRight = rest.join(':');
    const { lineWithoutComment, comment } = preProcessCode(partialRight);
    partialRight = lineWithoutComment;

    if (isNaN(Number(index))) {
      // 如果没有 fieldIndex，可能是注释行，跳过
      continue;
    }

    /**
     * 为了防止以后看不懂，详解如下
     *    - $1 (?:(optional|required)\s+)? 捕获 optional 或 required
     *    - $2 ([\w\d_>.,\s<]+) 捕获类型
     *    - $3 ([\w\d_]+)(?:\(.+\))? 捕获字段名
     *    - $4 (\(.+\)) 捕获括号附加信息
     *    - $5 (?:\s*=\s*([\d\.\w_-]+|true|false|"[^"]*"|'[^']*'))? 捕获默认值
     *        - [\d\.\w_-]+             数字，enum？（不确定 thrift 是否支持 EnumType.XXX 作为默认值）
     *        - true|false              顾名思义
     *        - "[^"]*"|'[^']*'         匹配字符串
     *    - $6 (?:(?:\s+)?(?:\/{2,}|#{1,})(.+))? 捕获注释
     */
    const mc = /(?:(optional|required)\s+)?([\w\d_>.,\s<]+)\s+([\w\d_]+)\s*(\(.+\))?(?:\s*=\s*([\d\.\w_-]+|true|false|"[^"]*"|'[^']*'))?\s*[,;]?$/.exec(
      partialRight
    );

    /* istanbul ignore if */
    if (mc === null) {
      continue;
    }

    const type = typeMapping(mc[2].trim());
    let key = mc[3].trim();
    const extra = mc[4];
    const defaultValue = (mc[5] || '').trim();
    let optional = options.useStrictMode
      ? mc[1] !== 'required'
      : !(mc[1] !== 'optional');
    if (defaultValue) {
      // 如果有默认值，不需要指定 optional
      optional = false;
    }

    if (
      options.useTag &&
      extra &&
      extra.match(/(\w+).tag="json:\\"([\w_\d]+).*\\"/)
    ) {
      if (RegExp.$1 === options.useTag) {
        key = RegExp.$2;
      }
    }

    properties[key] = {
      optional,
      comment,
      type,
      index: Number(index),
      defaultValue
    };
  }

  return {
    name,
    properties,
    childrenInterfaces: [],
    childrenEnums: []
  };
}

export function preProcessCode(line: string) {
  let comment = '';
  const indexOfTagBlock = line.indexOf('(');
  const indexOfCommentBlock = Math.max(line.indexOf('//'), line.indexOf('#'));
  let commentStartIndex = 0;
  if (indexOfTagBlock !== -1 && indexOfCommentBlock > indexOfTagBlock) {
    let j = indexOfTagBlock + 1;
    const l = line.length;
    let x = 1;
    let ch = '';
    while (j < l) {
      ch = line[j++];
      if (ch === '(') x++;
      if (ch === ')') {
        x--;
        if (x === 0) {
          commentStartIndex = j + 1;
          break;
        }
      }
    }
  }

  line
    .substr(commentStartIndex)
    .replace(/(?:\/{2,}|#{1,}).+/, v => ((comment = v), ''));

  const lineWithoutComment = line.replace(comment, '');
  comment = comment
    .trim()
    .replace(/^\/{2,}|#{1,}/, '')
    .trim();
  const len = lineWithoutComment.length;
  let i = 0;
  let char: string;
  let pairCount = 0;
  let resultCode = '';
  while (i < len) {
    char = lineWithoutComment[i++];
    resultCode += char;
    if (char === '<') {
      pairCount++;
    }
    if (char === '>') {
      pairCount--;
      if (pairCount === 0 && lineWithoutComment[i] !== ' ') {
        resultCode += ' ';
      }
    }
  }
  return {
    comment,
    lineWithoutComment: resultCode.trim()
  };
}

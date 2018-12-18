import { typeMapping } from './typeMapping';
import {
  InterfaceEntity,
  InterfacePropertyEntity,
  CMDOptions
} from '../interfaces';
import { parseEnum } from './parseEnum';

const msgTypeTrapRegExp = /^message\s+([\w\d_]+)\s*{/;
const msgOrEnumTypeTrapRegExp = /^(message|enum)\s+([\w\d_]+)\s*{/;
const trapFieldIndex = /^([^\/=]+)=\s*(\d+)\s*(?:\[default\s*=\s*(.+)\])?[^\/]+/;
const trapComments = /(\/\/\s*(.+))$/;
const splitToken = /(?:(repeated|optional)\s+)?(map<[^>]+>|[^\s\/]+)\s+([^\s\/]+)/;

export function parseMessage(
  codes: string[],
  options: Partial<CMDOptions> = {}
): InterfaceEntity {
  const entity: InterfaceEntity = {
    name: '',
    properties: {},
    childrenEnums: [],
    childrenInterfaces: []
  };
  entity.name = msgTypeTrapRegExp.exec(codes[0].trim())![1];
  entity.properties = {};
  const propertyLines = codes
    .map(d => d.trim())
    .filter(d => !!d)
    .slice(1, codes.length - 1);
  clearRegExp();

  for (let i = 0; i < propertyLines.length; i++) {
    // 去掉无用的 = {index}
    let fieldName = '';
    const codeLine = propertyLines[i].trim();
    const property: InterfacePropertyEntity = {
      type: '',
      index: NaN,
      optional: false,
      comment: '',
      defaultValue: ''
    };

    // 如果是 message，递归分析 message 类型，组成树形结构
    if (msgOrEnumTypeTrapRegExp.test(codeLine)) {
      const closeBracketIndex = findCloseBracketIndex(
        i,
        propertyLines,
        RegExp.$2
      );
      const subBlockType = RegExp.$1;
      clearRegExp();
      const subMessageBlocks = propertyLines.slice(i, closeBracketIndex + 1);
      if (subBlockType === 'enum') {
        const child = parseEnum(subMessageBlocks, options);
        entity.childrenEnums.push(child);
      } else if (subBlockType === 'message') {
        const child = parseMessage(subMessageBlocks, options);
        entity.childrenInterfaces.push(child);
      }
      i = closeBracketIndex;
      continue;
    }

    const lineWithoutIndex = codeLine.replace(trapFieldIndex, '$1').trim();
    if (!isNaN(Number(RegExp.$2))) {
      property.index = Number(RegExp.$2);
      // 如果有 defaultValue，需要额外处理
      const _defaultValue = RegExp.$3;
      if (_defaultValue) {
        property.defaultValue = parseDefaultValue(_defaultValue, entity);
      }
    } else {
      /* istanbul ignore next */
      continue;
    }
    clearRegExp();

    // 去掉注释
    const lineWithoutIndexAndComments = lineWithoutIndex
      .replace(trapComments, '')
      .trim();
    property.comment = RegExp.$2 || '';
    clearRegExp();

    const tmpMC = lineWithoutIndexAndComments.match(splitToken);
    if (!tmpMC) {
      continue;
    }
    const [_, ...tokens] = Array.prototype.slice.call(tmpMC);
    property.optional = tokens[0] === 'optional' && !property.defaultValue;
    property.type = typeMapping(tokens[1], tokens[0] === 'repeated');
    fieldName = tokens[2];
    /* istanbul ignore if */
    if (!fieldName) {
      console.warn(`Something may have error. ${entity.name} at [${codeLine}]`);
      continue;
    }

    entity.properties[fieldName] = property;
  }
  return entity;
}

/**
 * 返回 message 结束的行 index
 *
 * @param {number} currentIndex
 * @param {string[]} codeLines
 * @param {string} messageName
 * @returns {number}
 */
function findCloseBracketIndex(
  currentIndex: number,
  codeLines: string[],
  messageName: string
): number {
  let cur = '';
  const stackOfBracket: number[] = [1];
  while ((cur = codeLines[++currentIndex])) {
    if (cur.trim().charAt(0) === '}') {
      stackOfBracket.pop();
    } else if (msgOrEnumTypeTrapRegExp.test(cur)) {
      stackOfBracket.push(1);
    }

    if (stackOfBracket.length === 0) {
      return currentIndex;
    }
  }
  /* istanbul ignore next */
  throw new Error(`Invalid protobuf definition of ${messageName}`);
}

function clearRegExp() {
  ''.match(/.*/);
}

function parseDefaultValue(defaultValue: string, entity: InterfaceEntity) {
  let rtn = defaultValue.trim();
  for (const enumEntity of entity.childrenEnums) {
    const fieldNameList = Object.keys(enumEntity.properties);
    for (const fieldName of fieldNameList) {
      if (fieldName === rtn) {
        return `${enumEntity.name}.${fieldName}`;
      }
    }
  }
  return rtn;
}

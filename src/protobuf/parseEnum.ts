// copy from thrift/parseEnum.ts
import debug from 'debug';
import { EnumEntity, CMDOptions } from '../interfaces';

const enumDebugger = debug('parser:protobuf-enum');

export function parseEnum(codes: string[], _options?: Partial<CMDOptions>): EnumEntity {
  const name = /^enum\s+([\w\d_]+)(?:\s+)?{/.exec(codes[0].trim())![1];
  const properties: { [key: string]: { value: number; comment: string } } = {};
  const propertyLines = codes.filter(d => {
    const trimedLine = d.trim();
    if (!trimedLine) {
      return false;
    }
    if (trimedLine.indexOf('//') === 0) {
      return false;
    }
    return true;
  }).slice(1, codes.length - 1);

  for (let i = 0; i < propertyLines.length; i++) {
    const mc = /([\w\d_]+)\s*\=\s*(\d+)[\s,;]?(?:[\s]+)?(?:(?:(?:#+)\s*(.+))|(?:\/{2,}(?:\s+)?(.+)?))?/.exec(
      propertyLines[i]
    );

    /* istanbul ignore if */
    if (mc === null) {
      continue;
    }

    const comment: string = (mc[3] || mc[4] || '').trim();
    const key: string = mc[1].trim();
    const value: number = Number(mc[2]);

    /* istanbul ignore if */
    if (isNaN(value) || !key) {
      enumDebugger('continue: %o', mc);
      continue;
    }

    properties[key] = {
      value,
      comment
    };
  }

  return {
    name,
    properties
  };
}

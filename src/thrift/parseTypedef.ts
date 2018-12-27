import { TypeDefEntity, CMDOptions } from '../interfaces';
import { typeMapping } from './typeMapping';

export function parseTypedef(
  code: string,
  _options?: Partial<CMDOptions>
): TypeDefEntity | null {
  const mc = isTypeDef(code);
  if (mc && mc.length === 3) {
    return {
      type: typeMapping(mc[1]),
      alias: mc[2]
    };
  }
  return null;
}

function isTypeDef(code: string): null | string[] {
  return code.match(/^typedef\s([\w\d_>.<]+)\s([\w\d_]+)/);
}

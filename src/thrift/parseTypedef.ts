import { TypeDefEntity, CMDOptions } from '../interfaces';

export function parseTypedef(
  code: string,
  _options?: Partial<CMDOptions>
): TypeDefEntity | null {
  if (isTypeDef(code)) {
    return {
      type: RegExp.$1,
      alias: RegExp.$2
    };
  }
  return null;
}

function isTypeDef(code: string): boolean {
  return /^typedef\s([\w\d_>.<]+)\s([\w\d_]+)/.test(code);
}

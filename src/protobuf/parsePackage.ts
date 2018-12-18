import { CMDOptions, IHit } from '../interfaces';

export function parsePackage(
  line: string,
  _options?: Partial<CMDOptions>
): IHit {
  const mc = /^\s*package\s+([^\s\/]+);$/.exec(line.trim());
  if (!mc || mc.length === 0) {
    return {
      hit: false,
      mc: null
    };
  }
  return {
    hit: true,
    mc: mc[1]
  };
}

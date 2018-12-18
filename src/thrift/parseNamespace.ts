import { IHit, CMDOptions } from '../interfaces';

/**
 * 获取 namespace
 *
 * @export
 * @param {string} line
 * @returns {IHit}
 */
export function parseNamespace(
  line: string,
  _options?: Partial<CMDOptions>
): IHit {
  const mc = /^namespace\ +[^\s]+\ +(.+)$/.exec(line.trim());
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

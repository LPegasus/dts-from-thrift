import { IHit, CMDOptions } from '../interfaces';

/**
 * 好像没什么用，先放着
 *
 * @export
 * @param {string} line
 * @returns {IHit}
 */
export function parseInclude(
  line: string,
  _options?: Partial<CMDOptions>
): IHit {
  // include "sadsfasdf.thrift" | include "../../sadasdf.thrift"
  const mc = /include\ +(['"])([^\s]+)\1/.exec(line.trim());
  if (!mc || !mc.length) {
    return { mc: null, hit: false };
  }
  return { mc: mc[2], hit: true };
}

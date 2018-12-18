import { IHit, CMDOptions } from '../interfaces';

const trapImportFile = /^\s*import\ +(['"])([^\s\/]+)\1\s*;/;
/**
 * 拿到 include 的包
 *
 * @export
 * @param {string} line
 * @returns {IHit}
 */
export function parseImport(
  line: string,
  _options?: Partial<CMDOptions>
): IHit {
  const mc = trapImportFile.exec(line.trim());
  if (!mc || !mc.length) {
    return { mc: null, hit: false };
  }
  return { mc: mc[2], hit: true };
}

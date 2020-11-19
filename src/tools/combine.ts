/* istanbul ignore file */
import { CMDOptions } from '../interfaces';
import glob from 'glob';
import path from 'path';
import fs from 'fs';

/**
 * combine d.ts files => index.d.ts as an entry point file
 *
 * @export
 */
export default function combine(options: Partial<CMDOptions> = {}) {
  const tsRoot = options.tsRoot || process.cwd();
  const files = glob
    .sync('./**/*.ts', { cwd: tsRoot })
    .map((d) => path.resolve(tsRoot, d));
  const isFilenameConflict = !!files.find((f) => f === options.entryName);
  if (isFilenameConflict) {
    console.log(
      `\u001b[33mentry filename [${options.entryName}] is the same with output d.ts filename, please rename it.\u001b[39m`
    );
    return;
  }

  const lines = files.map((f) => {
    const relativePath = path.relative(tsRoot, f);
    if (options.useModule)
      return `export * from "./${relativePath.replace(/\.d\.ts$/, '')}";`;
    else return `/// <reference path="${relativePath}" />`;
  });

  fs.writeFileSync(
    options.entryName || 'index.d.ts',
    lines.join('\n') + '\n',
    'utf8'
  );
}

/* istanbul ignore file */
import path = require('path');
import fs = require('fs');
import cp = require('child_process');
import { semverCompare } from './semverCompare.js';
// @ts-ignore

// 提示更新，并且创建隐藏文件，已表示检查过了，之后不再提示
export function updateNotify(pkg) {
  const cfgFile = path.resolve(__dirname, '.dft-cfg');
  fs.exists(cfgFile, exists => {
    if (!exists) {
      cp.exec(`npm view ${pkg.name} version`, (err, stdout) => {
        fs.writeFile(cfgFile, '', () => {});
        if (err) {
          return;
        }

        const v = stdout;
        if (
          /^(0|1-9)\d*\.(0|1-9)\d*\.(0|1-9)\d*$/i.test(v) &&
          semverCompare(v, pkg.version) === '>'
        ) {
          console.log(
            `Tool dts-from-thrift has updated. The newest version is ${v}`
          );
        }
      });
    }
  });
}

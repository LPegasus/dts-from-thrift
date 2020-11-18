import { execSync } from 'child_process';
import * as path from 'path';
import { expect } from 'chai';
import rimraf from 'rimraf';

describe('--bail option bugfix for thrift', () => {
  let hasError = false;
  const outputTmpDirname = path.resolve(__dirname, 'tmp');
  const cmdPath = path.resolve(__dirname, '../../bin/dts-from-thrift');
  const invalidDirname = path.resolve(__dirname, './examples/invalid');
  try {
    execSync(`${cmdPath} -p ${invalidDirname} -o ${outputTmpDirname} --bail`);
  } catch (e) {
    console.log(e);
    hasError = true;
  } finally {
    rimraf.sync(outputTmpDirname);
  }
  expect(hasError).to.be.eq(true);
});

import { expect } from 'chai';
import * as path from 'path';
import * as child_process from 'child_process';
import * as fs from 'fs-extra';

describe('thrift - print', () => {
  it('support include external file', async () => {
    const inputDir = path.resolve(
      __dirname,
      '../fix_thrift_include_outside_file/input'
    );
    const outDir = path.resolve(
      __dirname,
      '../fix_thrift_include_outside_file/output'
    );
    const rootDir = path.resolve(__dirname, '../../');
    const cmdFile = path.resolve(__dirname, '../../bin/dts-from-thrift');
    child_process.spawnSync('yarn', ['build'], { cwd: rootDir });
    child_process.spawnSync('rm', ['-rf', outDir]);
    child_process.spawnSync('rm', ['-rf', outDir]);
    const res = child_process.spawnSync('node', [
      cmdFile,
      '-p',
      inputDir,
      '-o',
      outDir,
      '--new'
    ]);
    const exists = fs.existsSync(
      path.resolve(outDir, './external_files/base.d.ts')
    );
    expect(exists).to.equal(true);
  });
});

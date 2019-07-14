/* istanbul ignore file */
import commander from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import glob from 'glob';
import { RpcEntity, CMDOptions } from './interfaces';
import { readCode } from './protobuf/readCode';
import { print } from './protobuf/print';
import combine from './tools/combine';
import { loadPb } from './protobufNew/index';
import { updateNotify } from './tools/updateNotify';

const packageJSON = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8')
);
updateNotify(packageJSON);

commander
  .version(packageJSON.version)
  .usage('-p <proto_idl_dir> -o <typings_dir>')
  .option('-p, --project [dir]', 'pb 根目录，默认为当前目录', process.cwd())
  .option('-e --entry [filename]', '指定入口文件名', 'index.d.ts')
  .option('--lint', '检查 pb 文件是否规范，不输出内容')
  .option('--new', '使用新版')
  .option('--i64_as_number', '将 i64 类型设置为 number')
  .option(
    '-o, --out [out dir]',
    '输出 d.ts 文件根目录',
    path.resolve(process.cwd(), 'typings')
  );

commander.parse(process.argv);

const options: Partial<CMDOptions> &
  Required<Pick<CMDOptions, 'root' | 'tsRoot' | 'entryName'>> = {
  root: path.resolve(process.cwd(), commander.project),
  tsRoot: path.resolve(process.cwd(), commander.out),
  entryName: path.resolve(process.cwd(), commander.out, commander.entry),
  rpcNamespace: '',
  lint: !!commander.lint,
  i64_as_number: !!commander.i64_as_number
};

if (commander.new) {
  console.log('protobuf => d.ts using protobuf.js...');
  loadPb(options);
} else {
  const protofiles = glob
    .sync('**/*.proto', { cwd: options.root })
    .map(d => path.resolve(options.root, d));

  const includeMap: { [key: string]: RpcEntity } = {};
  const tasks = protofiles.map(async filename => {
    let entity: RpcEntity | null = null;
    try {
      entity = await readCode(filename, options, includeMap);
    } catch (e) {
      console.error(e);
      console.error(`read file fail.(${filename})`);
      return;
    }

    return entity;
  });

  Promise.all(tasks)
    .then(entityList => {
      return Promise.all(
        entityList.map(async entity => {
          try {
            return print(entity!, options, includeMap);
          } catch (e) {
            console.error(e);
            console.error(`write file fail.(${entity!.fileName})`);
          }
        })
      );
    })
    .then(async () => {
      combine(options);
      console.log(
        `\u001b[32mFinished.\u001b[39m Please check the d.ts files in \u001b[97m${
          options.tsRoot
        }\u001b[39m.`
      );
    });
}

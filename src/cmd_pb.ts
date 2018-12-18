/* istanbul ignore file */
import commander from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import glob from 'glob';
import { RpcEntity, CMDOptions } from './interfaces';
import { readCode } from './protobuf/readCode';
import { print } from './protobuf/print';
import combine from './tools/combine';
import { updateNotify } from './tools/updateNotify';

const packageJSON = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8')
);
updateNotify(packageJSON);

commander
  .version(packageJSON.version)
  .usage('-p <proto_idl_dir> -o <typings_dir>')
  .option('-p, --project [dir]', 'thrift 根目录，默认为当前目录', process.cwd())
  // .option('-an, --auto-namespace', '是否使用文件夹路径作为 namespace')
  // .option('-s --strict', '如果字段没有指定 required 视为 optional')
  .option('--timestamp', '在头部加上生成时间')
  .option('-e --entry [filename]', '指定入口文件名', 'index.d.ts')
  // .option('--use-tag <tagName>', '使用 tag 名称替换 field 名称')
  .option(
    '-o, --out [out dir]',
    '输出 d.ts 文件根目录',
    path.resolve(process.cwd(), 'typings')
  );

commander.parse(process.argv);

const options: CMDOptions = {
  root: path.resolve(process.cwd(), commander.project),
  tsRoot: path.resolve(process.cwd(), commander.out),
  entryName: path.resolve(process.cwd(), commander.out, commander.entry),
  autoNamespace: false,
  useStrictMode: false,
  useTimestamp: commander.timestamp,
  useTag: '',
  usePrettier: true,
  rpcNamespace: ''
};

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

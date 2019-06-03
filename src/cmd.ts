/* istanbul ignore file */
import commander from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import glob from 'glob';
import { RpcEntity, CMDOptions } from './interfaces';
import { readCode } from './thriftNew/index';
import { print, printCollectionRpc } from './thrift/print';
import combine from './tools/combine';
import { updateNotify } from './tools/updateNotify';
import { ServiceEntity } from './interfaces';
import { prettier } from './tools/format';

const packageJSON = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8')
);
updateNotify(packageJSON);

commander
  .version(packageJSON.version)
  .usage('-p <thrift_dir> -o <typings_dir>')
  .option('-p, --project [dir]', 'thrift 根目录，默认为当前目录', process.cwd())
  .option('-an, --auto-namespace', '是否使用文件夹路径作为 namespace')
  .option('-s --strict', '如果字段没有指定 required 视为 optional')
  .option('--timestamp', '在头部加上生成时间')
  .option('-e --entry [filename]', '指定入口文件名', 'index.d.ts')
  .option('--use-tag <tagName>', '使用 tag 名称替换 field 名称')
  .option('--prettier', '输出时使用 prettier 格式化', false)
  .option(
    '--rpc-namespace <rpc-namespace>',
    '指定一个独立的 namespace 存放所有 service',
    ''
  )
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
  autoNamespace: commander.autoNamespace,
  useStrictMode: commander.strict,
  useTimestamp: commander.timestamp,
  useTag: commander.useTag,
  usePrettier: commander.prettier,
  rpcNamespace: commander.rpcNamespace
};
fs.ensureDirSync(options.tsRoot);
fs.copyFileSync(
  path.join(__dirname, 'tools/tsHelper.d.ts'),
  path.join(options.tsRoot, 'tsHelper.d.ts')
);

const thriftFiles = glob
  .sync('**/*.thrift', { cwd: options.root })
  .map(d => path.resolve(options.root, d));

const includeMap: { [key: string]: RpcEntity } = {};
const tasks = thriftFiles.map(async filename => {
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

const rTasks: Array<Promise<any>> = [];
rTasks.push(
  Promise.all(tasks).then(entityList => {
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
);

// summary RPC service
if (options.rpcNamespace) {
  rTasks.push(
    Promise.all(tasks).then(async entityList => {
      const allServices: ServiceEntity[] = [];
      const rtn = entityList.reduce((rtn, entity) => {
        if (!entity || !entity.services.length) {
          return rtn;
        }
        allServices.push(...entity.services);
        const r = printCollectionRpc(entity, includeMap);
        if (!r) {
          return rtn;
        }
        rtn += r;
        return rtn;
      }, '');
      const tarPath = path.join(
        options.tsRoot,
        options.rpcNamespace + '-rpc.d.ts'
      );
      fs.writeFile(
        tarPath,
        prettier(`/// <reference path="./tsHelper.d.ts" />';

declare namespace ${options.rpcNamespace} {\n${rtn}
  export interface _Summary_ {
${allServices.map(d => `${d.name}: WrapperService<${d.name}>;`).join('\n  ')}
  }
}`),
        'utf8',
        () => {
          console.log(
            `\u001b[32mFinished.\u001b[39m RPC d.ts files is \u001b[97m${tarPath}\u001b[39m.`
          );
        }
      );
    })
  );
}

Promise.all(rTasks).then(async () => {
  combine(options);
  console.log(
    `\u001b[32mFinished.\u001b[39m Please check the d.ts files in \u001b[97m${
      options.tsRoot
    }\u001b[39m.`
  );
});

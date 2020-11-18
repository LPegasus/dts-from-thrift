/* istanbul ignore file */
import commander from 'commander';
import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import glob from 'glob';
import { CMDOptions } from './interfaces';
import { readCode as readCodeNew } from './thriftNew';
import {
  print as printNew,
  printCollectionRpc as printCollectionRpcNew,
  printEnumsObject,
} from './thriftNew/print';
import combine from './tools/combine';
import { updateNotify } from './tools/updateNotify';
import { replaceTsHelperInt64 } from './tools/utils';
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
  .option(
    '-i64 --i64 [i64Type]',
    '设置 i64 的转化类型。默认为“Int64”，可选string'
  )
  .option(
    '--map [mapType]',
    '设置 map 的转化类型。默认为“Map”，可选Record',
    false
  )
  .option(
    '--strict-request',
    '在名称包含 Request 的 Struct 中如果字段没有指定 required 视为 optional'
  )
  .option(
    '-ac --annotation-config <annotationConfig>',
    '额外的json配置文件，用来读取annotation配置'
  )
  .option('--timestamp', '在头部加上生成时间')
  .option('-e --entry [filename]', '指定入口文件名', 'index.d.ts')
  .option('--use-tag <tagName>', '使用 tag 名称替换 field 名称')
  .option('--prettier', '输出时使用 prettier 格式化', false)
  .option(
    '--rpc-namespace <rpc-namespace>',
    '指定一个独立的 namespace 存放所有 service',
    ''
  )
  .option('--enum-json [filename]', '以json的形式输出所有的enum到输出目录', '')
  .option(
    '-o, --out [out dir]',
    '输出 d.ts 文件根目录',
    path.resolve(process.cwd(), 'typings')
  )
  .option('--bail', 'exit with 1 when error occurs.');

commander.parse(process.argv);

const print = printNew;
const printCollectionRpc = printCollectionRpcNew;
const readCode = readCodeNew;

const options: CMDOptions = {
  root: path.resolve(process.cwd(), commander.project),
  tsRoot: path.resolve(process.cwd(), commander.out),
  entryName: path.resolve(process.cwd(), commander.out, commander.entry),
  autoNamespace: commander.autoNamespace,
  useStrictMode: commander.strict,
  useTimestamp: commander.timestamp,
  useTag: commander.useTag,
  usePrettier: commander.prettier,
  rpcNamespace: commander.rpcNamespace,
  useModule: false,
  lint: false,
  i64_as_number: false,
  annotationConfigPath: commander.annotationConfig
    ? path.resolve(process.cwd(), commander.annotationConfig || '')
    : undefined,
  strictReq: commander.strictRequest,
  enumJson: commander.enum_json || 'enums.json',
  i64Type: commander.i64 === 'string' ? 'string' : 'Int64',
  bail: !!commander.bail,
  mapType:
    commander.map === true || commander.map === 'Record' ? 'Record' : 'Map',
};
fs.ensureDirSync(options.tsRoot);
fs.copyFileSync(
  path.join(__dirname, 'tools/tsHelper.d.ts'),
  path.join(options.tsRoot, 'tsHelper.d.ts')
);
if (options.i64Type === 'string') {
  replaceTsHelperInt64(path.join(options.tsRoot, 'tsHelper.d.ts'));
}

const thriftFiles = glob
  .sync('**/*.thrift', { cwd: options.root })
  .map((d) => path.resolve(options.root, d));

// 在不同的模式下includeEntity是不相互兼容的，所以使用any
const includeMap: { [key: string]: any } = {};
const tasks = thriftFiles.map(async (filename) => {
  let entity: any = null;
  try {
    entity = await readCode(filename, options, includeMap);
  } catch (e) {
    if (options.bail) {
      throw e;
    }
    console.error(e);
    console.error(`read file fail.(${filename})`);
    return;
  }

  return entity;
});

const rTasks: Array<Promise<any>> = [];
rTasks.push(
  Promise.all(tasks).then(async (entityList) => {
    if (options.enumJson) {
      const tarFile = path.join(options.tsRoot, options.enumJson);
      await fs.ensureFile(tarFile);
      await fs.writeJSON(tarFile, printEnumsObject(includeMap), { spaces: 4 });
    }

    return Promise.all(
      entityList.map(async (entity) => {
        try {
          return print(entity!, options, includeMap);
        } catch (e) {
          console.error(e);
          console.error(`write file fail.(${entity!.fileName})`);
          throw new Error(e);
        }
      })
    );
  })
);

// summary RPC service
if (options.rpcNamespace) {
  rTasks.push(
    Promise.all(tasks).then(async (entityList) => {
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
      const tempMap: Record<string, boolean> = {};
      fs.writeFile(
        tarPath,
        prettier(`/// <reference path="./tsHelper.d.ts" />';

declare namespace ${options.rpcNamespace} {\n${rtn}
  export interface _Summary_ {
    ${allServices
      .map((d) => {
        let rtn = `${d.name}: WrapperService<${d.name}>;`;
        if (tempMap[d.name] === true) {
          rtn = '';
          console.warn(
            `\u001b[43;30mduplicate service name "${d.name}" when build _Summary_\u001b[0m`
          );
        }
        tempMap[d.name] = true;
        return rtn;
      })
      .filter(Boolean)
      .join('\n  ')}
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

Promise.all(rTasks)
  .then(async () => {
    combine(options);
    console.log(
      `${chalk.green('Finished.')} Please check the d.ts files in ${chalk.cyan(
        options.tsRoot
      )}.`
    );
  })
  .catch((reason) => {
    if (options.bail) {
      throw reason;
    }
  });

process.on('unhandledRejection', (reason) => {
  console.log(chalk.red('dts-from-thrift exit with following errors:'));
  console.log(chalk.dim('%o'), reason);
  process.exit(1);
});

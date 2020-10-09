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
import { replaceTsHelperInt64 } from './tools/utils';
import chalk from 'chalk';

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
  .option('--i64_as_number', '将 i64 类型设置为 number')
  .option('--enum-json [filename]', '以json的形式输出所有的enum到输出目录', '')
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
    '-o, --out [out dir]',
    '输出 d.ts 文件根目录',
    path.resolve(process.cwd(), 'typings')
  )
  .option('--bail', 'exit with 1 when error occurs.');

commander.parse(process.argv);

const options: Partial<CMDOptions> &
  Required<Pick<CMDOptions, 'root' | 'tsRoot' | 'entryName'>> = {
  root: path.resolve(process.cwd(), commander.project),
  tsRoot: path.resolve(process.cwd(), commander.out),
  entryName: path.resolve(process.cwd(), commander.out, commander.entry),
  rpcNamespace: '',
  lint: !!commander.lint,
  enumJson: commander.enumJson || 'enums.json',
  i64_as_number: !!commander.i64_as_number,
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

const includeMap: { [key: string]: RpcEntity } = {};

if (commander.new || true) {
  console.log('protobuf => d.ts using protobuf.js...');
  const outConstMap = Object.create(null);
  (async () => {
    await loadPb(options, outConstMap);
    if (options.enumJson) {
      const tar = path.resolve(options.root, options.enumJson);
      await fs.ensureFile(path.resolve(options.root, options.enumJson));
      await fs.writeFile(tar, JSON.stringify(outConstMap, null, '  '), 'utf8');
    }
  })();
} else {
  const protofiles = glob
    .sync('**/*.proto', { cwd: options.root })
    .map((d) => path.resolve(options.root, d));

  const tasks = protofiles.map(async (filename) => {
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
    .then(async (entityList) => {
      return Promise.all(
        entityList.map(async (entity) => {
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
        `\u001b[32mFinished.\u001b[39m Please check the d.ts files in \u001b[97m${options.tsRoot}\u001b[39m.`
      );
    });
}

process.on('unhandledRejection', (reason) => {
  console.log(chalk.yellow('convert pb -> d.ts error:'));
  console.log(reason);
  process.exit(1);
});

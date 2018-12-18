import * as path from 'path';
import * as fs from 'fs-extra';
import * as os from 'os';
import {
  RpcEntity,
  CMDOptions,
  InterfaceEntity,
  EnumEntity
} from '../interfaces';
import { prettier } from '../tools/format';

const now = new Date();
const timeString = `${now.getFullYear()}-${now.getMonth() +
  1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
/* istanbul ignore next */
export async function print(
  entity: RpcEntity | undefined,
  options: Partial<CMDOptions> & Pick<CMDOptions, 'root' | 'tsRoot'>,
  includeMap: { [key: string]: RpcEntity }
): Promise<void> {
  if (!entity || !entity.ns) {
    // 过滤掉没有 namespace 的
    return;
  }
  entity.ns = options.autoNamespace
    ? printNamespace(entity, options.root)
    : entity.ns;
  const content = `// prettier-ignore
// generate${
    options.useTimestamp ? ` at ${timeString}` : ''
  } by dts-from-protobuf
declare namespace ${entity.ns} {
${printEnums(entity.enums)}
${printInterfaces(entity)}
}
`;
  const relativePath: path.ParsedPath = path.parse(
    path.relative(options.root, entity.fileName)
  );
  const target = path.resolve(
    options.tsRoot,
    relativePath.dir,
    `${relativePath.name}.d.ts`
  );

  await fs.ensureFile(target);
  return fs.writeFile(
    target,
    fixIncludeNamespace(content, entity, includeMap),
    'utf8'
  );
}

/**
 * 根据到 root 的相对路径生成 namespace
 *
 * @param {RpcEntity} entity
 * @param {string} root
 * @returns {string} namespace
 */
function printNamespace(entity: RpcEntity, root: string): string {
  const relativePath: path.ParsedPath = path.parse(
    path.relative(root, entity.fileName)
  );
  const ns = relativePath.dir.replace(new RegExp(`\\${path.sep}`, 'g'), '.');
  if (ns.indexOf('.') === 0) {
    throw new Error('ns error');
  }

  return ns;
}

/**
 * 输出 enums
 *
 * @export
 * @param {RpcEntity} entity thrift entity
 * @param {boolean=false} noExport  是否暴露
 * @returns {string}
 */
export function printEnums(
  enums: EnumEntity[],
  noExport: boolean = false
): string {
  if (!enums || enums.length === 0) {
    return '';
  }

  let rtn: string = '';
  enums.forEach((datum, _i) => {
    rtn += `  ${noExport ? '' : 'export'} const enum ${datum.name} {
    ${Object.keys(datum.properties)
      .map((key, i, arr) => {
        const property = datum.properties[key];
        return attachComment(
          `${key} = ${property.value}${arr.length - 1 === i ? '' : ','}`,
          property.comment
        );
      })
      .join('\n    ')}
  }

`;
  });
  return rtn;
}

/**
 * 输出 interfaces，不同于 thrift 版本，需要额外处理嵌套声明
 *
 * @export
 * @param {Pick<RpcEntity, 'interfaces' | 'ns'>} entity thrift entity
 * @param {boolean=false} noExport  是否暴露
 * @returns {string}
 */
export function printInterfaces(
  entity: Pick<RpcEntity, 'interfaces'>,
  noExport: boolean = false
): string {
  if (!entity.interfaces || entity.interfaces.length === 0) {
    return '';
  }

  let rtn = '';
  entity.interfaces.forEach((datum, _i) => {
    if (datum.childrenEnums.length + datum.childrenInterfaces.length > 0) {
      rtn += printInternalInterfacesAndEnums(datum);
    }
    rtn += `  ${noExport ? '' : 'export'} interface ${datum.name} {
    ${Object.keys(datum.properties)
      .map((key, i, arr) => {
        const property = datum.properties[key];
        return attachComment(
          `${key}${property.optional ? '?' : ''}: ${property.type};`,
          property.comment,
          property.defaultValue
        );
      })
      .join('\n    ')}
  }

`;
  });

  return rtn;
}

/**
 * 输出 typedef
 *
 * @export
 * @param {RpcEntity} entity
 * @returns {string}
 */
export function printTypeDefs(entity: RpcEntity): string {
  if (entity.typeDefs.length === 0) {
    return '';
  }

  let rtn = '';
  entity.typeDefs.forEach(datum => {
    rtn += `  export type ${datum.alias} = ${datum.type};\n`;
  });
  return rtn + '\n';
}

/**
 * 以 12 个半角字符宽度对齐行注释
 *
 * @param {string} str
 * @param {string} comment
 * @returns {string}
 */
function attachComment(
  str: string,
  comment: string,
  defaultValue?: string
): string {
  let c = comment;
  if (defaultValue) {
    if (!c) {
      c = `(default: ${defaultValue})`;
    } else {
      c += ` (default: ${defaultValue})`;
    }
  }

  if (!c) {
    return str;
  }
  const len = str.length + 1;
  const len2 = Math.ceil(len / 12) * 12;
  return `${str.padEnd(len2, ' ')}// ${c}`;
}

/**
 * 这个函数用来修复类型是通过 import 导入的名称
 *
 * @export
 * @param {string} content
 * @param {RpcEntity} entity
 * @param {{ [key: string]: RpcEntity }} includeMap
 * @returns {string}
 */
export function fixIncludeNamespace(
  content: string,
  entity: RpcEntity,
  includeMap: { [key: string]: RpcEntity }
): string {
  let result = content;
  const currentFile = path.parse(entity.fileName);
  entity.includes.forEach(include => {
    // 获取所有 include 语句所对应的 entity
    const includeKey = path.resolve(currentFile.dir, include);
    const includeEntity = includeMap[includeKey];

    if (!includeEntity) {
      return;
    }

    const shouldBeNS = includeEntity.ns; // 需要替换成的 namespace
    const shouldReplaceNS = path.parse(include).name; // 如果文件中有用到 filename 作为 namespace

    result = result.replace(
      new RegExp(`([^\\w])${shouldReplaceNS}\\.`, 'g'),
      `$1${shouldBeNS}.`
    );
  });

  return prettier(result);
}

export function getInternalInterfacesAndEnums(
  entity: InterfaceEntity,
  enums: EnumEntity[] = [],
  interfaces: InterfaceEntity[] = []
): [EnumEntity[], InterfaceEntity[]] {
  if (entity.childrenEnums.length) {
    enums.push(...entity.childrenEnums);
  }

  let child: InterfaceEntity;
  let i = 0;
  while ((child = entity.childrenInterfaces[i++])) {
    interfaces.push({ ...child, childrenEnums: [], childrenInterfaces: [] });
    getInternalInterfacesAndEnums(child, enums, interfaces);
  }
  return [enums, interfaces];
}

export function printInternalInterfacesAndEnums(entity: InterfaceEntity) {
  const rtn: string[] = [];
  const [enums, interfaces] = getInternalInterfacesAndEnums(entity);
  rtn.push(printEnums(enums, true));
  rtn.push(printInterfaces({ interfaces }, true));
  return rtn.join(os.EOL);
}

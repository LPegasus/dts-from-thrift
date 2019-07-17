import { ServiceEntity } from './../interfaces';
import * as path from 'path';
import * as fs from 'fs-extra';
import { RpcEntity, CMDOptions } from '../interfaces';
// import { prettier } from '../tools/format';

const now = new Date();
const timeString = `${now.getFullYear()}-${now.getMonth() +
  1}-${now.getDate()} ${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
/* istanbul ignore next */
export async function print(
  entity: RpcEntity | undefined,
  options: CMDOptions,
  includeMap: { [key: string]: RpcEntity }
): Promise<void> {
  if (!entity || !entity.ns) {
    // 过滤掉没有 namespace 的
    return;
  }
  const ns = options.autoNamespace
    ? printNamespace(entity, options.root)
    : entity.ns;
  const content = `// prettier-ignore
// generate${options.useTimestamp ? ` at ${timeString}` : ''} by dts-from-thrift
declare namespace ${ns} {
${printEnums(entity)}
${printInterfaces(entity)}
${printTypeDefs(entity)}${printServices(entity)}
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
  /* istanbul ignore if */
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
 * @returns {string}
 */
export function printEnums(entity: RpcEntity): string {
  /* istanbul ignore if */
  if (!entity.enums || entity.enums.length === 0) {
    return '';
  }

  let rtn: string = '';
  entity.enums.forEach((datum, _i) => {
    rtn += `  export const enum ${datum.name} {
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
 * 输出 interfaces
 *
 * @export
 * @param {Pick<RpcEntity, 'interfaces'>} entity thrift entity
 * @returns {string}
 */
export function printInterfaces(entity: Pick<RpcEntity, 'interfaces'>): string {
  if (!entity.interfaces || entity.interfaces.length === 0) {
    return '';
  }

  let rtn = '';
  entity.interfaces.forEach((datum, _i) => {
    rtn += `  export interface ${datum.name} {
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
 * @param {Pick<RpcEntity, 'fileName' | 'includes'>} entity
 * @param {{ [absolutFilepath: string]: RpcEntity }} includeMap
 * @returns {string}
 */
export function fixIncludeNamespace(
  content: string,
  entity: Partial<RpcEntity> & Pick<RpcEntity, 'fileName' | 'includes'>,
  includeMap: {
    [absolutFilepath: string]: Partial<RpcEntity> & Pick<RpcEntity, 'ns'>;
  }
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
      new RegExp(
        `(\\W)((?<!__SEGMENT__.*)${shouldReplaceNS}\\.|${shouldReplaceNS}(?!.*__SEGMENT__)\\.)`,
        'g'
      ),
      `__SEGMENT__$1${shouldBeNS}__SEGMENT__.`
    );
  });

  return result.replace(new RegExp(`__SEGMENT__`, 'g'), '');
}

/**
 * 打印 service
 *
 * @export
 * @param {RpcEntity} entity
 * @param {boolean} [isGenerateRPC=false] 如果是用来生成 RPC 的打印，需要加上 namespace
 * @returns
 */
export function printServices(
  entity: RpcEntity,
  isGenerateRPC: boolean = false
) {
  const serviceEntity = entity.services;
  const keyInNs = [
    ...entity.enums.map(d => d.name),
    ...entity.typeDefs.map(d => d.alias),
    ...entity.interfaces.map(d => d.name)
  ];
  return serviceEntity.reduce((rtn, cur) => {
    rtn += `  export interface ${cur.name} {
${Object.keys(cur.interfaces)
  .map(key => {
    const i = cur.interfaces[key];
    let sortTmp: any[] = [];
    i.inputParams.forEach(d => (sortTmp[d.index] = d));
    sortTmp = sortTmp.filter(d => !!d);
    const inputParamsStr = (sortTmp as (typeof i)['inputParams'])
      .map(d => {
        const type =
          isGenerateRPC && keyInNs.indexOf(d.type) !== -1
            ? `${entity.ns}.${d.type}`
            : d.type;
        return `${d.name}: ${type}`;
      })
      .join(', ');
    const returnType =
      isGenerateRPC && keyInNs.indexOf(i.returnType) !== -1
        ? `${entity.ns}.${i.returnType}`
        : i.returnType;
    return attachComment(
      `    ${key}(${inputParamsStr}): Promise<${returnType}>;`,
      i.comment
    );
  })
  .join('\n')}
  }

`;
    return rtn;
  }, '');
}

export function printCollectionRpc(
  entity: RpcEntity,
  includeMap: {
    [absolutFilepath: string]: Partial<RpcEntity> & Pick<RpcEntity, 'ns'>;
  }
): string | null {
  if (!entity.services.length) {
    return null;
  }
  const servicesCodes = printServices(entity, true);
  const rtn = fixIncludeNamespace(servicesCodes, entity, includeMap);
  return rtn;
}

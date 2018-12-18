import * as fs from 'fs-extra';
import { parseNamespace } from './parseNamespace';
import { parseInclude } from './parseInclude';
import { parseEnum } from './parseEnum';
import { parseStruct } from './parseStruct';
import { parseTypedef } from './parseTypedef';
import { parseService, isServiceBlockStart } from './parseService';
import { RpcEntity, IHit, CMDOptions } from '../interfaces';

export async function readCode(
  filefullname: string,
  options?: Partial<CMDOptions>,
  includeMap?: { [key: string]: RpcEntity }
): Promise<RpcEntity> {
  const codes = (await fs.readFile(filefullname, 'utf8'))
    .split(/(\r\n)|(\n)/g)
    .filter(d => !!d);

  // 预处理单行 { 的情况，合并到前面一行
  for (let i = codes.length - 1; i >= 0; i--) {
    if (/^\s*{\s*(#.*|\/\/.*|\/\*.*)?$/.test(codes[i].trim())) {
      codes[i - 1] += codes[i];
    }
  }

  const rtn: RpcEntity = {
    ns: '',
    fileName: filefullname,
    includes: [],
    interfaces: [],
    enums: [],
    typeDefs: [],
    services: []
  };

  let currentLine: string = '';
  let i = 0;
  let blockStartType: 'enum' | 'struct' | 'comment' | 'service' | '' = ''; // block statement 类型
  let blockStartIndex: number = 0; // block statement 开始位置
  while ((currentLine = codes[i++])) {
    let tmp: IHit = { hit: false, mc: null };
    if (!currentLine.trim()) continue;

    // 0. 首先判断是否是 block 结束
    if (
      (blockStartType === 'enum' ||
        blockStartType === 'struct' ||
        blockStartType === 'service') &&
      currentLine.trim().match(/^}/)
    ) {
      const blockLines = codes.slice(blockStartIndex, i);
      switch (blockStartType) {
        case 'enum':
          rtn.enums.push(parseEnum(blockLines, options));
          break;
        case 'struct':
          rtn.interfaces.push(parseStruct(blockLines, options));
          break;
        case 'service':
          rtn.services.push(parseService(blockLines, options));
          break;
      }
      blockStartType = '';
      continue;
    } else if (blockStartType === 'comment') {
      if (currentLine.trim().match(/\*\//)) {
        blockStartType = '';
      }
      continue;
    }

    // 检查多行注释的开头
    if (!blockStartType && isCommentBlockStart(currentLine)) {
      blockStartType = 'comment';
      blockStartIndex = i - 1;
      continue;
    }

    // 1. 检查是否是 namespace 语句
    // namespace 不同的情况没处理，需手动解决
    if (!rtn.ns) {
      tmp = parseNamespace(currentLine, options);
      if (tmp.hit) {
        rtn.ns = tmp.mc!;
        continue;
      }
    }

    // 2. 检查 include 语句
    tmp = parseInclude(currentLine, options);
    if (tmp.hit) {
      rtn.includes.push(tmp.mc);
      continue;
    }

    // 3. 检查 enum 语句
    if (isEnumStart(currentLine)) {
      blockStartType = 'enum';
      blockStartIndex = i - 1;
      continue;
    }

    // 4. 检查 struct 语句
    if (isStructStart(currentLine)) {
      blockStartType = 'struct';
      blockStartIndex = i - 1;
      continue;
    }

    tmp = isServiceBlockStart(currentLine);
    if (tmp.hit && tmp.mc) {
      blockStartType = 'service';
      blockStartIndex = i - 1;
      continue;
    }

    // 5. 检查 typedef 语句
    const defTemp = parseTypedef(currentLine, options);
    if (defTemp) {
      rtn.typeDefs.push(defTemp);
      continue;
    }
  }

  /* istanbul ignore if */
  if (includeMap) {
    includeMap[rtn.fileName] = rtn;
  }

  return rtn;
}

export function isStructStart(line: string): boolean {
  return /^struct\s+([\w\d_]+)(?:\s+)?\{/.test(line.trim());
}

// function isCommentLine(line: string): boolean {
//   const tline = line.trim();
//   return tline.indexOf('//') === 0 || tline.indexOf('#') === 0;
// }

function isCommentBlockStart(line: string): boolean {
  return line.trim().match(/^\s*\/\*/) !== null && line.indexOf('*/') === -1;
}

function isEnumStart(line: string): boolean {
  return /^enum\s/.test(line.trim());
}

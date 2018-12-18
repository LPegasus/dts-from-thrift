import * as fs from 'fs-extra';
import { parsePackage } from './parsePackage';
import { parseImport } from './parseImport';
import { parseEnum } from './parseEnum';
import { parseMessage } from './parseMessage';
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
  let blockStartType: 'enum' | 'message' | 'comment' | '' = ''; // block statement 类型
  let blockStartIndex: number = 0; // block statement 开始位置
  const blockBracketStack: Array<1> = [];
  while ((currentLine = codes[i++])) {
    let tmp: IHit = { hit: false, mc: null };

    // 0. 首先判断是否是 block 结束
    if (
      (blockStartType === 'enum' || blockStartType === 'message') &&
      currentLine.trim().match(/^}/)
    ) {
      blockBracketStack.pop();
      if (blockBracketStack.length === 0) { // bracket 已经匹配完成
        const blockLines = codes.slice(blockStartIndex, i); // 注意：i 在 while 中已经 +1，所以已经指向下一行的 index 了
        if (blockStartType === 'enum') {
          rtn.enums.push(parseEnum(blockLines, options));
        }
        if (blockStartType === 'message') {
          rtn.interfaces.push(parseMessage(blockLines, options));
        }
        blockStartType = '';
      }
      continue;
    } else if (blockStartType === 'comment') {  // 如果是多行注释，查看是否多行注释结束
      if (currentLine.trim().match(/\*\//)) {
        blockStartType = '';
      }
      continue;
    } else if (blockStartType) {
      if (isMessageStart(currentLine)) {
        blockBracketStack.push(1);
      }
      continue;
    }

    // 检查多行注释的开头
    if (isCommentBlockStart(currentLine)) {
      blockStartType = 'comment';
      blockStartIndex = i - 1;
      continue;
    }

    // 1. 检查是否是 namespace 语句
    // namespace 不同的情况没处理，需手动解决
    if (!rtn.ns) {
      tmp = parsePackage(currentLine, options);
      if (tmp.hit) {
        rtn.ns = tmp.mc!;
        continue;
      }
    }

    // 2. 检查 import 语句
    tmp = parseImport(currentLine, options);
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

    // 4. 检查 message 语句
    if (isMessageStart(currentLine)) {
      blockStartType = 'message';
      blockStartIndex = i - 1;
      blockBracketStack.push(1);
      continue;
    }
  }

  if (includeMap) {
    includeMap[rtn.fileName] = rtn;
  }

  return rtn;
}

export function isMessageStart(line: string): boolean {
  return /^message\s+([\w\d_]+)(?:\s+)?\{/.test(line.trim());
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

import { CMDOptions } from '../interfaces';
import { IHit, ServiceEntity } from '../interfaces';

/**
 * service ItemProviderService {
     RangeResponse    RangeItem            (1: RangeRequest req)  #总是按时间倒序
     // 根据时间来请求item信息
     ItemListResponse ItemListByCreateTime (1: RangeRequest req)  #总是按时间倒序
     // 根据ID来请求详情
     ItemListResponse ItemListByID         (1: ItemIDListRequest req)  #按照ID
   }
 *
 * @export
 * @param {string[]} codeLines
 */
export function parseService(
  codeLines: string[],
  _options?: Partial<CMDOptions>
): ServiceEntity {
  // 兼容例如 `service ItemProviderSerivce {  RangeResponse    RangeItem (1: RangeRequest req)  #总是按时间倒序` 的格式
  formatServiceFirstLine(codeLines);
  const serviceName = isServiceBlockStart(codeLines[0]).mc!;
  const rtn: ServiceEntity = {
    name: serviceName,
    interfaces: {}
  };
  let i = 1;
  for (; i < codeLines.length; i++) {
    const code = codeLines[i];
    parseServiceInterface(rtn.interfaces, code.trim());
  }
  return rtn;
}

export function formatServiceFirstLine(lines: string[]) {
  let firstLine = lines[0];
  let cmt = '';
  firstLine = firstLine
    .replace(/(?:#|\/{2}).*$/, v => {
      cmt = v;
      return '';
    })
    .replace(/\{/, '{\n')
    .replace(/\}/, '\n}');
  const newLines = firstLine.split('\n');
  newLines[Math.min(newLines.length - 1, 1)] += cmt;
  return lines.splice(0, 1, ...newLines);
  // let char = '';
  // let i = 0;
  // const inserts = [];
  // while ((char = firstLine[i++])) {
  //   if ((char === '/' && firstLine[i] === '/') || char === '#') {
  //     // 如果发现是注释，再见
  //     break;
  //   }
  //   if (char === '{' && firstLine.substr(i).trim().length > 0) {
  //     inserts.push(lines[0] = firstLine.substr(0, i));
  //   }
  //   if (char === '}') {
  //     inserts.push('}');
  //   }
  // }
  // if (inserts.length > 0) {
  //   return lines.splice(1, 0, ...inserts);
  // } else {
  //   return lines;
  // }
}

const trapInterfaceRegExp = /^([^\s#\/]+)\s+([^\s\/]+)\s*\(([^\)]*)\)(?:\s+throws\(.+\))?[\s,;]?\s*(?:(?:#|\/\/)(.+))?$/;
export function parseServiceInterface(
  interfaces: ServiceEntity['interfaces'],
  code: string
): void {
  const mc = trapInterfaceRegExp.exec(code);
  if (!mc) {
    return;
  }
  const inputParams: ServiceEntity['interfaces']['d']['inputParams'] = [];
  mc[3]
    .split(',')
    .map(d => d.trim())
    .filter(d => !!d)
    .forEach(d => {
      const _mc = d.match(/(\d+)\s*\:\s*(?:(?:([^\s]+)\s+)|([^\s]+>))(.+)$/);
      if (_mc) {
        inputParams.push({
          index: Number(_mc[1]),
          name: _mc[4],
          type: _mc[2]
        });
      }
    });

  interfaces[mc[2]] = {
    returnType: mc[1],
    inputParams,
    comment: (mc[4] || '').trim()
  };
}

const trapServiceNameRegExp = /^\s*service\s+([\w_][^\s]*)\s*\{/;
export function isServiceBlockStart(code: string): IHit {
  const mc = trapServiceNameRegExp.exec(code);
  if (mc) {
    return {
      hit: true,
      mc: mc[1]
    };
  }
  return {
    hit: false,
    mc: null
  };
}

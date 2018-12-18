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
export function parseService(codeLines: string[], _options?: Partial<CMDOptions>): ServiceEntity {
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

const trapInterfaceRegExp = /^([^\s\/]+)\s+([^\s\/]+)\s*(?:(?:\(\s*\d+\s*\:\s*([^\s]+)?\s+[^\s]+\s*\))|\(\s*\))(?:\s+throws\(.+\))?[\s,;]?\s*(?:(?:#|\/\/)(.+))?$/;
export function parseServiceInterface(
  interfaces: ServiceEntity['interfaces'],
  code: string
): void {
  const mc = trapInterfaceRegExp.exec(code);
  if (!mc) {
    return;
  }
  interfaces[mc[2]] = {
    returnType: mc[1],
    inputType: (mc[3] || ''),
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

import * as fs from 'fs-extra';

export function isUndefined(v: any): v is undefined {
  return typeof v === 'undefined';
}

export function replaceTsHelperInt64(filePath: string) {
  const strToReplace = `declare var Int64: {
    prototype: Int64;
    new (): Int64;
};
interface Int64 {
    toString(): string;
}
declare type ReqNumber = number | string | Int64;
declare type RespNumber = Int64;
declare type WrapperReqNumber<T> = Int64 extends T ? ReqNumber : T extends number[] ? ReqNumber[] : T;
declare type WrapperRespNumber<T> = T extends number ? RespNumber : T extends number[] ? RespNumber[] : T;`;
  const newStr = `declare type Int64 = string
declare type ReqNumber = number | string | Int64;
declare type RespNumber = Int64;
declare type WrapperReqNumber<T> = T;
declare type WrapperRespNumber<T> = T;`;
  fs.writeFileSync(
    filePath,
    fs
      .readFileSync(filePath)
      .toString()
      .replace(strToReplace, newStr)
  );
}

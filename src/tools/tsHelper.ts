/* eslint-disable no-redeclare */
declare var Int64: {
  prototype: Int64;
  new (): Int64;
};

interface Int64 {
  toString(): string;
}

declare type ReqNumber = number | string | Int64;
declare type RespNumber = Int64;
declare type WrapperReqNumber<T> = Int64 extends T
  ? ReqNumber
  : T extends number[]
  ? ReqNumber[]
  : T;
declare type WrapperRespNumber<T> = T extends number
  ? RespNumber
  : T extends number[]
  ? RespNumber[]
  : T;

declare type WrapperResponse<P> = {
  [key in keyof P]: WrapperRespNumber<P[key]>;
};

declare type WrapperInterface<T> = T extends (req: infer Q) => Promise<infer R>
  ? (req: WrapperRequest<Q>) => Promise<WrapperResponse<R>>
  : T;
declare type WrapperService<T> = { [K in keyof T]: WrapperInterface<T[K]> };
declare type WrapperRequest<
  P extends {
    [key: string]: any;
  },
  PK extends PartialKeys<P> = PartialKeys<P>
> = { Base?: P['Base'] } & {
  [key in Exclude<PK, 'Base'>]+?: WrapperReqNumber<P[key]>;
} &
  { [key in Exclude<keyof P, PK | 'Base'>]: WrapperReqNumber<P[key]> };

declare type PartialKeys<T, K extends keyof T = keyof T> = K extends keyof T
  ? undefined extends T[K]
    ? K
    : never
  : never;

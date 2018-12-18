interface Uint64Type {
  toString(): string;
  lower: number;
  higher: number;
  value: number;
}

type ReqNumber = number | string | Uint64Type;
type RespNumber = number | Uint64Type;
type WrapperReqNumber<T> = T extends number
  ? ReqNumber
  : T extends number[]
  ? ReqNumber[]
  : T;
type WrapperRespNumber<T> = T extends number
  ? RespNumber
  : T extends number[]
  ? RespNumber[]
  : T;
type WrapperRequest<P extends { [key: string]: any }> = {
  [key in Exclude<keyof P, 'Base'>]: WrapperReqNumber<P[key]>
} &
  { [key in 'Base']?: P['Base'] };
type WrapperResponse<P> = { [key in keyof P]: WrapperRespNumber<P[key]> };
type WrapperInterface<T> = T extends (req: infer Q) => Promise<infer R>
  ? (req: WrapperRequest<Q>) => Promise<WrapperResponse<R>>
  : T;
type WrapperService<T> = { [K in keyof T]: WrapperInterface<T[K]> };

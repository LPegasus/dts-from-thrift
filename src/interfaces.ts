export type IHit = { hit: false; mc: null } | { hit: true; mc: string };

export interface RpcEntity {
  enums: EnumEntity[];
  fileName: string;
  includes: string[];
  ns: string;
  interfaces: InterfaceEntity[];
  typeDefs: TypeDefEntity[];
  services: ServiceEntity[];
}

export interface EnumEntity {
  name: string;
  properties: {
    [key: string]: {
      value: number;
      comment: string;
    };
  };
}

export type Unpack<T> = T extends Array<infer U> ? U : T;

export interface InterfaceEntity {
  name: string;
  properties: {
    [key: string]: InterfacePropertyEntity;
  };
  childrenInterfaces: InterfaceEntity[];
  childrenEnums: EnumEntity[];
}

export interface InterfacePropertyEntity {
  type: string;
  index: number;
  optional: boolean;
  comment: string;
  defaultValue: string;
}

export interface TypeDefEntity {
  alias: string;
  type: string;
}

export interface ServiceEntity {
  name: string;
  interfaces: {
    [key: string]: {
      returnType: string;
      inputType: string;
      comment: string;
    };
  };
}

export interface CMDOptions {
  root: string;
  tsRoot: string;
  autoNamespace: boolean;
  useStrictMode: boolean;
  useTimestamp: boolean;
  entryName: string;
  useTag: string;
  usePrettier: boolean;
  rpcNamespace: string;
}

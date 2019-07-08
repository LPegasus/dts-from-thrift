export type IHit = { hit: false; mc: null } | { hit: true; mc: string };

// TODO: 加入annotation支持
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
    [key: string]: EnumEntityMember;
  };
}

export interface EnumEntityMember {
  value: number;
  comment: string;
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
    [key: string]: FunctionEntity;
  };
}

export interface FunctionEntity {
  returnType: string;
  inputParams: Array<{
    type: string;
    index: number;
    name: string;
  }>;
  comment: string;
}

export interface IAnnotationConfig {
  fieldKey?: string;
  fieldComment?: string[];
  functionMethod?: string;
  functionUri?: string;
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
  thriftNew?: boolean;
  annotationConfigPath?: string;
  annotationConfig?: IAnnotationConfig;
}

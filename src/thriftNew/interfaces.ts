import * as pb from 'protobufjs';

import {
  SyntaxType,
  TextLocation,
  Comment
} from './@creditkarma/thrift-parser';

// 支持comment，开发时间就一丢丢所以复用一下print，理想情况是直接用@creditkarma/thrift-parser的ast打印
// 现在输出的版本comments表达能力大于原始的版本，但是缺失
export interface Node {
  syntaxType: SyntaxType;
}

export interface SyntaxNode {
  loc: TextLocation;
}

export interface PrimarySyntax extends SyntaxNode {
  comments: Array<Comment>;
  commentsBefore?: Array<Comment>;
  commentsAfter?: Array<Comment>;
}

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
  consts: ConstantEntity[];
}

// https://thrift.apache.org/docs/idl#constant-values 实际上可以是int，double，字符串字面量，const list，const map，先快速支持int和double
export type ConstantEntityType =
  | SyntaxType.ByteKeyword
  | SyntaxType.DoubleKeyword
  | SyntaxType.I8Keyword
  | SyntaxType.I16Keyword
  | SyntaxType.I32Keyword
  | SyntaxType.I64Keyword
  | SyntaxType.StringKeyword;
export interface ConstantEntity extends PrimarySyntax {
  name: string;
  type: ConstantEntityType;
  value: string;
  typeString: string;
}
export interface EnumEntity extends PrimarySyntax {
  name: string;
  properties: {
    [key: string]: EnumEntityMember;
  };
}

export interface EnumEntityMember extends PrimarySyntax {
  value: number;
}

export type Unpack<T> = T extends Array<infer U> ? U : T;

export interface InterfaceEntity extends PrimarySyntax {
  name: string;
  properties: {
    [key: string]: InterfacePropertyEntity;
  };
}

export interface InterfacePropertyEntity extends PrimarySyntax {
  type: string;
  index: number;
  optional: boolean;
  defaultValue: string;
  required?: boolean;
}

export interface TypeDefEntity extends PrimarySyntax {
  alias: string;
  type: string;
}

export interface ServiceEntity extends PrimarySyntax {
  name: string;
  interfaces: {
    [key: string]: FunctionEntity;
  };
}

export interface FunctionEntity extends PrimarySyntax {
  returnType: string;
  inputParams: Array<{
    type: string;
    index: number;
    name: string;
  }>;
}

export interface IAnnotationConfig {
  fieldKey?: string | string[];
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
  useModule: boolean;
  rpcNamespace: string;
  lint: boolean;
  i64_as_number: boolean;
  annotationConfigPath?: string;
  annotationConfig?: IAnnotationConfig;
  strictReq?: boolean;
  enumJson?: string;
  i64Type?: string;
  mapType?: string;
}

export type PbNodeEntity = (
  | {
      type: 'namespace';
      meta: pb.Namespace;
    }
  | {
      type: 'message';
      meta: pb.Type;
    }
  | {
      type: 'service';
      meta: pb.Service;
    }
  | {
      type: 'enum';
      meta: pb.Enum;
    }
) & { filename: string };

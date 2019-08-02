import {
  parse,
  ThriftDocument,
  ThriftErrors,
  SyntaxType,
  ThriftStatement,
  Comment,
  FunctionType,
  FieldDefinition,
  FunctionDefinition,
  EnumDefinition
} from './@creditkarma/thrift-parser';
import {
  RpcEntity,
  CMDOptions,
  InterfacePropertyEntity,
  InterfaceEntity,
  TypeDefEntity,
  ServiceEntity,
  FunctionEntity,
  EnumEntity,
  EnumEntityMember
} from './interfaces';
import { handleComments } from './handleComments';
import * as fs from 'fs-extra';
import { throws } from 'assert';

export async function readCode(
  filefullname: string,
  options?: Partial<CMDOptions>, // TODO 添加option支持
  includeMap?: { [key: string]: RpcEntity }
): Promise<RpcEntity> {
  const source = await fs.readFile(filefullname);
  return parser(filefullname, source.toString(), options, includeMap);
}

export function parser(
  filefullname: string,
  source: string,
  options?: Partial<CMDOptions>, // TODO 添加option支持
  includeMap?: { [key: string]: RpcEntity }
): RpcEntity {
  const ast: ThriftDocument | ThriftErrors = parse(source);
  if (!isThritDocument(ast)) {
    throw new Error('thrift parser error:' + filefullname);
  }
  handleComments(ast);
  if (options && options.annotationConfigPath) {
    if (fs.existsSync(options.annotationConfigPath)) {
      try {
        options.annotationConfig = JSON.parse(
          fs.readFileSync(options.annotationConfigPath).toString()
        );
      } catch (e) {
        console.error(e);
      }
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

  ast.body.forEach((ts: ThriftStatement) => {
    // namespace
    if (ts.type === SyntaxType.NamespaceDefinition) {
      // namespace 的处理逻辑，抓一个就来了
      // TODO 优先考虑js的namespace，之后是go，再之后随便抓一个
      if (ts.scope.value === 'go' || ts.scope.value === 'js') {
        rtn.ns = ts.name.value;
      }
    }
    // includes
    if (ts.type === SyntaxType.IncludeDefinition) {
      rtn.includes.push(ts.path.value);
    }
    // struct like: struct exception union --> interfaces
    if (
      ts.type === SyntaxType.StructDefinition ||
      ts.type === SyntaxType.UnionDefinition ||
      ts.type === SyntaxType.ExceptionDefinition
    ) {
      const name: string = ts.name.value;
      const aInterface: InterfaceEntity = {
        name,
        properties: {},
        loc: ts.loc,
        comments: ts.comments,
        commentsAfter: ts.commentsAfter,
        commentsBefore: ts.commentsBefore
      };
      // 添加属性
      ts.fields.forEach((field: any) => {
        const { entity: temp, name } = handleField(field, options);
        aInterface.properties[name] = temp;
      });
      rtn.interfaces.push(aInterface);
    }

    // typedef
    if (ts.type === SyntaxType.TypedefDefinition) {
      const aTypeDef: TypeDefEntity = {
        type: '',
        alias: '',
        comments: ts.comments,
        commentsAfter: ts.commentsAfter,
        commentsBefore: ts.commentsBefore,
        loc: ts.loc
      };
      aTypeDef.alias = ts.name.value;
      aTypeDef.type = getFieldTypeString(ts.definitionType);
      rtn.typeDefs.push(aTypeDef);
    }

    // service
    if (ts.type === SyntaxType.ServiceDefinition) {
      const aService: ServiceEntity = {
        name: ts.name.value,
        interfaces: {},
        comments: ts.comments,
        commentsAfter: ts.commentsAfter,
        commentsBefore: ts.commentsBefore,
        loc: ts.loc
      };
      ts.functions.forEach(func => {
        aService.interfaces[func.name.value] = handleFunction(func, options);
      });
      rtn.services.push(aService);
    }

    // enum
    if (ts.type === SyntaxType.EnumDefinition) {
      rtn.enums.push(handleEnum(ts));
    }

    // const 考虑支持
    if (ts.type === SyntaxType.ConstDefinition) {
      //
    }
  });

  /* istanbul ignore if */
  if (includeMap) {
    includeMap[rtn.fileName] = rtn;
  }
  return rtn;
}

function isThritDocument(
  ast: ThriftDocument | ThriftErrors
): ast is ThriftDocument {
  return ast.type === SyntaxType.ThriftDocument;
}

/**
 *
 * @param {ThriftDocument} ast thrift-parser输出的ast
 * @returns {RpcEntity} 返回rpc
 */
export function transformAst(ast: ThriftDocument): RpcEntity {
  return {} as any;
}

function getFieldTypeString(fieldType: FunctionType): string {
  const ThriftType2JavascriptType: { [key: string]: string } = {
    [SyntaxType.BoolKeyword]: 'boolean',
    [SyntaxType.ByteKeyword]: 'number',
    [SyntaxType.I16Keyword]: 'number',
    [SyntaxType.I32Keyword]: 'number',
    [SyntaxType.I64Keyword]: 'Int64',
    [SyntaxType.DoubleKeyword]: 'number',
    [SyntaxType.StringKeyword]: 'string',
    [SyntaxType.BinaryKeyword]: 'any',
    [SyntaxType.ListKeyword]: 'Array',
    [SyntaxType.MapKeyword]: 'Map',
    [SyntaxType.SetKeyword]: 'Set',
    // UPDATE 添加void
    [SyntaxType.VoidKeyword]: 'void'
  };

  if (fieldType.type === SyntaxType.Identifier) {
    return fieldType.value;
  }
  if (fieldType.type === SyntaxType.SetType) {
    return `Set<${getFieldTypeString(fieldType.valueType)}>`;
  }
  if (fieldType.type === SyntaxType.ListType) {
    return `${getFieldTypeString(fieldType.valueType)}[]`;
  }
  if (fieldType.type === SyntaxType.MapType) {
    return `Map<${getFieldTypeString(fieldType.keyType)}, ${getFieldTypeString(
      fieldType.valueType
    )}>`;
  }
  return ThriftType2JavascriptType[fieldType.type];
}

interface IhandleField {
  entity: InterfacePropertyEntity;
  name: string;
}

function handleField(
  field: FieldDefinition,
  options: Partial<CMDOptions> = {}
): IhandleField {
  let name = field.name.value;
  const commentsBefore = field.commentsBefore || [];
  // 需要处理typedef
  const type = getFieldTypeString(field.fieldType);
  const index = field.fieldID ? field.fieldID.value : 0;
  const optional = options.useStrictMode
    ? field.requiredness !== 'required'
    : !(field.requiredness !== 'optional');
  // TODO 考虑多种type数据的default value StringLiteral | IntConstant | DoubleConstant | BooleanLiteral | ConstMap | ConstList | Identifier
  if (options.useTag) {
    const annotations = field.annotations;
    const tagValueReg = /json:\"([\w_\d]+).*\"/;
    const tagNameReg = /(\w+).tag/;
    if (annotations) {
      const nameTag = annotations.annotations.find(
        (annotation: { name: { value: string } }) => {
          let match;
          if ((match = tagNameReg.exec(annotation.name.value))) {
            return match[1] === options.useTag;
          }
          return false;
        }
      );
      if (nameTag) {
        const match = tagValueReg.exec(
          nameTag.value ? nameTag.value.value : ''
        );
        if (match) {
          name = match[1];
        }
      }
    }
  }
  // annotation config 优先级高于useTag
  if (options && options.annotationConfig) {
    const { fieldComment, fieldKey } = options.annotationConfig;
    if (
      field.annotations &&
      Array.isArray(field.annotations.annotations) &&
      (Array.isArray(fieldComment) || fieldKey)
    ) {
      let comment = '';
      field.annotations.annotations.forEach(annotation => {
        if (Array.isArray(fieldComment)) {
          if (fieldComment.indexOf(annotation.name.value) > -1) {
            comment += `${annotation.name.value}:${
              annotation!.value!.value
            }    `;
          }
        }
        if (fieldKey) {
          if (annotation.name.value === fieldKey) {
            name = annotation!.value!.value;
          }
        }
      });
      commentsBefore.push({
        type: SyntaxType.CommentLine,
        value: comment,
        loc: field.loc
      });
    }
  }
  const defaultValue = '';
  return {
    entity: {
      type,
      index,
      optional,
      defaultValue,
      comments: field.comments,
      commentsBefore,
      commentsAfter: field.commentsAfter,
      loc: field.loc
    },
    name
  };
}

/* 
  returnType: string;
  inputParams: Array<{
    type: string;
    index: number;
    name: string;
  }>;
  comment: string;
 */
function handleFunction(
  func: FunctionDefinition,
  options?: Partial<CMDOptions> | undefined
): FunctionEntity {
  const returnType = getFieldTypeString(func.returnType);
  const inputParams = func.fields.map((field: any) => {
    const { entity: temp, name } = handleField(field, options);
    return {
      type: temp.type,
      index: temp.index,
      name
    };
  });
  let comment = '';
  if (options && options.annotationConfig) {
    // 根据annotation生成config
    const { functionMethod, functionUri } = options.annotationConfig;
    if (functionMethod || functionUri) {
      if (func.annotations && Array.isArray(func.annotations.annotations)) {
        func.annotations.annotations.forEach(annotation => {
          if (functionMethod) {
            if (annotation.name.value === functionMethod) {
              comment += `@method: ${annotation!.value!.value}    `;
            }
          }
          if (functionUri) {
            if (annotation.name.value === functionUri) {
              comment += `@uri: ${annotation!.value!.value}    `;
            }
          }
        });
      }
    }
  }
  const commentsBefore = func.commentsBefore || [];
  if (comment) {
    commentsBefore.push({
      loc: func.loc,
      value: comment,
      type: SyntaxType.CommentLine
    });
  }
  return {
    returnType,
    inputParams,
    comments: [],
    loc: func.loc,
    commentsBefore,
    commentsAfter: func.commentsAfter
  };
}

function handleEnum(e: EnumDefinition, options?: CMDOptions): EnumEntity {
  const name = e.name.value;
  const properties: {
    [key: string]: EnumEntityMember;
  } = {};
  let currentValue = 0;
  e.members.forEach(member => {
    /**
     * https://wiki.apache.org/thrift/Tutorial
     * You can define enums, which are just 32 bit integers. Values are optional
     * and start at 1 if not supplied, C style again.
     *              ^ ThriftIDL page says "If no constant value is supplied,
     *   the value is either 0 for the first element, or one greater than the
     *   preceding value for any subsequent element" so I'm guessing that's a bug.
     *   PS: http://enel.ucalgary.ca/People/Norman/enel315_winter1997/enum_types/ states that if values are not supplied, they start at 0 and not 1.
     */
    let value: number;
    if (member.initializer) {
      value = parseInt(member.initializer.value.value, 10);
    } else {
      value = currentValue++;
    }
    properties[member.name.value] = {
      value,
      loc: member.loc,
      comments: member.comments,
      commentsBefore: member.commentsBefore,
      commentsAfter: member.commentsAfter
    };
  });
  return {
    name,
    properties,
    loc: e.loc,
    comments: e.comments,
    commentsBefore: e.commentsBefore,
    commentsAfter: e.commentsAfter
  };
}

import { expect } from 'chai';
import * as path from 'path';

import { readCode } from '../../src/thriftNew';
import {
  Comment,
  CommentBlock,
  CommentLine,
  SyntaxType,
  TextLocation,
} from '../../src/thriftNew/@creditkarma/thrift-parser/types';
import { RpcEntity } from '../../src/thriftNew/interfaces';
import {
  fixIncludeNamespace,
  printCollectionRpc,
  printCommentLine,
  printConsts,
  printEnums,
  printEnumsObject,
  printInterfaces,
  printServices,
  printTypeDefs,
} from '../../src/thriftNew/print';

describe('thriftNew - print', () => {
  // mock location
  const loc: TextLocation = {
    start: {
      line: 0,
      column: 0,
      index: 0,
    },
    end: {
      line: 0,
      column: 0,
      index: 0,
    },
  };
  // mock comments
  const comments: Comment[] = [];

  const buildCommentLine = (val: string): CommentLine => ({
    type: SyntaxType.CommentLine,
    value: val,
    loc: {
      start: { line: 7, column: 18, index: 145 },
      end: { line: 7, column: 22, index: 149 },
    },
  });

  const buildCommentBlock = (val: string[]): CommentBlock => ({
    type: SyntaxType.CommentBlock,
    value: val,
    loc: {
      start: { line: 25, column: 1, index: 520 },
      end: { line: 38, column: 4, index: 751 },
    },
  });

  const entity: RpcEntity = {
    services: [],
    ns: '',
    fileName: '',
    consts: [],
    enums: [
      {
        name: 'BizType',
        properties: {
          ALL: {
            value: 0,
            comments: [],
            commentsBefore: [],
            commentsAfter: [buildCommentLine('所有')],
            loc,
          },
          SKU: {
            value: 1,
            comments: [],
            commentsAfter: [buildCommentLine('SKU')],
            loc,
          },
        },
        loc,
        comments,
      },
      {
        name: 'Gender',
        properties: {
          F: {
            value: 0,
            comments,
            commentsAfter: [buildCommentLine('female')],
            loc,
          },
          M: {
            value: 1,
            comments: [],
            commentsAfter: [buildCommentLine('male')],
            loc,
          },
          UN: {
            value: 3,
            comments: [],
            commentsAfter: [buildCommentLine('UNKNOWN')],
            loc,
          },
          H: {
            value: 4,
            comments: [],
            commentsAfter: [buildCommentLine('half')],
            loc,
          },
        },
        comments,
        loc,
      },
    ],
    typeDefs: [
      {
        alias: 'CollectionResponse',
        type: 'Collection',
        loc,
        comments,
      },
      {
        alias: 'CollectionRequest',
        type: 'Collection',
        loc,
        comments,
      },
    ],
    includes: [],
    interfaces: [
      {
        name: 'BizRequest',
        properties: {
          biz_type: {
            type: 'BizType',
            comments: [],
            commentsAfter: [buildCommentLine('(default: 3)')],
            index: 0,
            optional: false,
            defaultValue: '3',
            loc,
          },
          biz_id: {
            type: 'string',
            comments: [],
            commentsAfter: [buildCommentLine('biz id')],
            index: 1,
            optional: false,
            defaultValue: '"3"',
            loc,
          },
          biz_ext: {
            type: 'any',
            comments: [],
            commentsBefore: [buildCommentLine('66666')],
            index: 2,
            optional: true,
            defaultValue: '',
            loc,
          },
        },
        loc,
        comments,
        commentsBefore: [
          buildCommentBlock(['@method: post', '@uri: /example']),
        ],
      },
    ],
  };
  it('enum print success', () => {
    // 编排格式的事情交给prettier
    expect(printEnums(entity)).to.deep.eq(
      `  export const enum BizType {
    /** 所有 */
    ALL = 0,
    /** SKU */
    SKU = 1
  }    

  export const enum Gender {
    /** female */
    F = 0,
    /** male */
    M = 1,
    /** UNKNOWN */
    UN = 3,
    /** half */
    H = 4
  }    

`
    );
  });

  it('interface print success', () => {
    const rtn = printInterfaces(entity);
    expect(rtn).to.deep.eq(`/*
 * @method: post
 * @uri: /example
 */
export interface BizRequest {
  /** (default: 3) */
  biz_type: BizType;
  /** biz id */
  biz_id: string;
  /** 66666 */
  biz_ext?: any;
}
`);
  });

  it('typedef print success', () => {
    expect(printTypeDefs(entity)).to.deep
      .eq(`  export type CollectionResponse = Collection;
  export type CollectionRequest = Collection;

`);
  });

  it('fixIncludeNamespace success', () => {
    expect(
      fixIncludeNamespace(
        `interface interface1 {
  data: list<feed.feedData[]>;
}
`,
        {
          enums: [],
          fileName: '/test/root/demo.thrift',
          includes: ['/test/root/feed.thrift'],
          ns: 'life.demo',
          interfaces: [],
          typeDefs: [],
          services: [],
        },
        {
          '/test/root/feed.thrift': {
            enums: [],
            services: [],
            fileName: '/test/root/feed.thrift',
            includes: [],
            ns: 'life.api_feed',
            interfaces: [],
            typeDefs: [],
          },
        }
      )
    ).to.eq(
      `// prettier-ignore\ninterface interface1 {\n  data: list<life.api_feed.feedData[]>;\n}\n`
    );
  });

  it('fixIncludeNamespace success with nest path', () => {
    const res = fixIncludeNamespace(
      `interface interface1 {
        data: list<detail.PackedItem>;
        sort: item.SortType
      }`,
      {
        enums: [],
        fileName: '/test/root/demo.thrift',
        includes: ['/test/root/detail.thrift', '/test/root/item.thrift'],
        ns: 'life.demo',
        interfaces: [],
        typeDefs: [],
        services: [],
      },
      {
        '/test/root/detail.thrift': {
          enums: [],
          services: [],
          fileName: '/test/root/detail.thrift',
          includes: [],
          ns: 'life.item.detail',
          interfaces: [],
          typeDefs: [],
        },
        '/test/root/item.thrift': {
          enums: [],
          services: [],
          fileName: '/test/root/item.thrift',
          includes: [],
          ns: 'life.demo.item',
          interfaces: [],
          typeDefs: [],
        },
      }
    );
    expect(res).not.eq(`interface interface1 {
      data: list<life.item.detail.PackedItem>;
      sort: life.demo.item.SortType
    }`);
  });

  it('printService success', () => {
    const rtn = printServices(
      {
        ns: 'test',
        consts: [],
        includes: [],
        enums: [],
        typeDefs: [],
        fileName: '',
        interfaces: [
          {
            name: 'Input1',
            properties: {},
            comments,
            loc,
          },
        ],
        services: [
          {
            name: 'RpcService1',
            interfaces: {
              a: {
                inputParams: [
                  { type: 'Input1', name: 'req1', index: 1 },
                  { type: 'Input2', name: 'req2', index: 2 },
                ],
                returnType: 'Output1',
                comments: [],
                commentsAfter: [buildCommentLine('comment1')],
                loc,
              },
            },
            loc,
            comments,
          },
          {
            name: 'RpcService2',
            interfaces: {
              a: {
                inputParams: [{ type: 'Input2', name: 'req2', index: 1 }],
                returnType: 'Output2',
                comments: [],
                loc,
              },
            },
            comments,
            loc,
          },
        ],
      },
      true
    );
    expect(rtn).to.eq(
      `  export interface RpcService1 {
    /** comment1 */
    a(req1: test.Input1, req2: Input2): Promise<Output1>;
  }

  export interface RpcService2 {
    a(req2: Input2): Promise<Output2>;
  }

`
    );
  });

  it('printCollectionRpc success', () => {
    const rtn = printCollectionRpc(
      {
        ns: 'l6',
        interfaces: [],
        consts: [],
        typeDefs: [
          {
            alias: 'Input1',
            type: '_Input1',
            loc,
            comments,
          },
        ],
        enums: [
          {
            name: 'Input2',
            properties: {},
            loc,
            comments,
          },
        ],
        fileName: '/life/client',
        includes: ['/life/common'],
        services: [
          {
            name: 'RpcService1',
            interfaces: {
              a: {
                inputParams: [{ type: 'Input1', name: 'req', index: 1 }],
                returnType: 'common.Output1',
                comments: [],
                commentsAfter: [buildCommentLine('comment1')],
                loc,
              },
            },
            loc,
            comments,
          },
          {
            name: 'RpcService2',
            interfaces: {
              a: {
                inputParams: [{ type: 'Input2', name: 'req', index: 2 }],
                returnType: 'common.Output2',
                comments: [],
                loc,
              },
            },
            comments,
            loc,
          },
        ],
      },
      {
        '/life/common': {
          ns: 'life.common',
        },
      }
    );
    expect(rtn).to.be.eq(
      `// prettier-ignore
export interface RpcService1 {
  /** comment1 */
  a(req: l6.Input1): Promise<life.common.Output1>;
}

export interface RpcService2 {
  a(req: l6.Input2): Promise<life.common.Output2>;
}
`
    );
  });

  it('print empty service param interface', async () => {
    const rtn = await readCode(
      path.join(__dirname, 'examples', 'service.thrift')
    );
    expect(printServices(rtn).indexOf('WebFake()') !== -1).to.eq(true);
  });

  it('print enum json success', async () => {
    const fileName = path.join(__dirname, 'examples', 'enumJson.thrift');
    const rtn = await readCode(fileName);
    const enums = printEnumsObject({ [fileName]: rtn });
    const enumObj = {
      'life.api_favorite.AizType.ALL': 0,
      'life.api_favorite.AizType.GOODS': 1,
      'life.api_favorite.BizType.ALL': 0,
      'life.api_favorite.BizType.GOODS': 1,
      'life.api_favorite.C32': 1234,
      'life.api_favorite.C64': '12345678',
      'life.api_favorite.CDouble': 1000,
      'life.api_favorite.CString': '123123',
      'life.api_favorite.ZizType.ALL': 0,
      'life.api_favorite.ZizType.GOODS': 1,
    };
    expect(JSON.stringify(enums)).to.eq(JSON.stringify(enumObj));
  });

  it('print const success', async () => {
    const fileName = path.join(__dirname, 'examples', 'enumJson.thrift');
    const rtn = await readCode(fileName);
    const consts = printConsts(rtn);
    expect(consts).to.eq(`  export const C32 = 1234
  export const C64 = '12345678'
  export const CDouble = 1e3
  export const CString = '123123'
`);
  });

  it('add comment bugfix: single line comment with `*/` should be stripped', () => {
    const result = printCommentLine({
      loc: {
        start: {
          index: 0,
          column: 0,
          line: 0,
        },
        end: {
          index: 0,
          column: 0,
          line: 0,
        },
      },
      type: SyntaxType.CommentLine,
      value: '***** 1****/**fasdf*///*/**',
    });
    expect(result).to.eq('/** ***** 1*****fasdf** */');
  });
});

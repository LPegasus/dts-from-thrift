import { expect } from 'chai';
import * as path from 'path';
import { RpcEntity } from '../../src/thriftNew/interfaces';
import {
  printEnums,
  printInterfaces,
  printTypeDefs,
  fixIncludeNamespace,
  printServices,
  printCollectionRpc
} from '../../src/thriftNew/print';
import {
  TextLocation,
  SyntaxType,
  CommentLine,
  CommentBlock,
  Comment
} from '../../src/thriftNew/@creditkarma/thrift-parser/types';
import { readCode } from '../../src/thriftNew';

describe('thrift - print', () => {
  // mock location
  const loc: TextLocation = {
    start: {
      line: 0,
      column: 0,
      index: 0
    },
    end: {
      line: 0,
      column: 0,
      index: 0
    }
  };
  // mock comments
  const comments: Comment[] = [];

  const buildCommentLine = (val: string): CommentLine => ({
    type: SyntaxType.CommentLine,
    value: val,
    loc: {
      start: { line: 7, column: 18, index: 145 },
      end: { line: 7, column: 22, index: 149 }
    }
  });

  const buildCommentBlock = (val: string[]): CommentBlock => ({
    type: SyntaxType.CommentBlock,
    value: val,
    loc: {
      start: { line: 25, column: 1, index: 520 },
      end: { line: 38, column: 4, index: 751 }
    }
  });

  const entity: RpcEntity = {
    services: [],
    ns: '',
    fileName: '',
    enums: [
      {
        name: 'BizType',
        properties: {
          ALL: {
            value: 0,
            comments: [],
            commentsBefore: [],
            commentsAfter: [buildCommentLine('所有')],
            loc
          },
          SKU: {
            value: 1,
            comments: [],
            commentsAfter: [buildCommentLine('SKU')],
            loc
          }
        },
        loc,
        comments
      },
      {
        name: 'Gender',
        properties: {
          F: {
            value: 0,
            comments,
            commentsAfter: [buildCommentLine('female')],
            loc
          },
          M: {
            value: 1,
            comments: [],
            commentsAfter: [buildCommentLine('male')],
            loc
          },
          UN: {
            value: 3,
            comments: [],
            commentsAfter: [buildCommentLine('UNKNOWN')],
            loc
          },
          H: {
            value: 4,
            comments: [],
            commentsAfter: [buildCommentLine('half')],
            loc
          }
        },
        comments,
        loc
      }
    ],
    typeDefs: [
      {
        alias: 'CollectionResponse',
        type: 'Collection',
        loc,
        comments
      },
      {
        alias: 'CollectionRequest',
        type: 'Collection',
        loc,
        comments
      }
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
            loc
          },
          biz_id: {
            type: 'string',
            comments: [],
            commentsAfter: [buildCommentLine('biz id')],
            index: 1,
            optional: false,
            defaultValue: '"3"',
            loc
          },
          biz_ext: {
            type: 'any',
            comments: [],
            commentsBefore: [buildCommentLine('66666')],
            index: 2,
            optional: true,
            defaultValue: '',
            loc
          }
        },
        loc,
        comments,
        commentsBefore: [buildCommentBlock(['@method: post', '@uri: /example'])]
      }
    ]
  };
  it('enum print success', () => {
    // 编排格式的事情交给prettier
    expect(printEnums(entity)).to.deep.eq(
      `  export const enum BizType {
    ALL = 0,     // 所有

    SKU = 1      // SKU

  }    

  export const enum Gender {
    F = 0,       // female

    M = 1,       // male

    UN = 3,      // UNKNOWN

    H = 4        // half

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
    biz_type: BizType;       // (default: 3)

    biz_id: string;          // biz id

    // 66666
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
          services: []
        },
        {
          '/test/root/feed.thrift': {
            enums: [],
            services: [],
            fileName: '/test/root/feed.thrift',
            includes: [],
            ns: 'life.api_feed',
            interfaces: [],
            typeDefs: []
          }
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
        services: []
      },
      {
        '/test/root/detail.thrift': {
          enums: [],
          services: [],
          fileName: '/test/root/detail.thrift',
          includes: [],
          ns: 'life.item.detail',
          interfaces: [],
          typeDefs: []
        },
        '/test/root/item.thrift': {
          enums: [],
          services: [],
          fileName: '/test/root/item.thrift',
          includes: [],
          ns: 'life.demo.item',
          interfaces: [],
          typeDefs: []
        }
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
        includes: [],
        enums: [],
        typeDefs: [],
        fileName: '',
        interfaces: [
          {
            name: 'Input1',
            properties: {},
            comments,
            loc
          }
        ],
        services: [
          {
            name: 'RpcService1',
            interfaces: {
              a: {
                inputParams: [
                  { type: 'Input1', name: 'req1', index: 1 },
                  { type: 'Input2', name: 'req2', index: 2 }
                ],
                returnType: 'Output1',
                comments: [],
                commentsAfter: [buildCommentLine('comment1')],
                loc
              }
            },
            loc,
            comments
          },
          {
            name: 'RpcService2',
            interfaces: {
              a: {
                inputParams: [{ type: 'Input2', name: 'req2', index: 1 }],
                returnType: 'Output2',
                comments: [],
                loc
              }
            },
            comments,
            loc
          }
        ]
      },
      true
    );
    expect(rtn).to.eq(
      `  export interface RpcService1 {
    a(req1: test.Input1, req2: Input2): Promise<Output1>;    // comment1

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
        typeDefs: [
          {
            alias: 'Input1',
            type: '_Input1',
            loc,
            comments
          }
        ],
        enums: [
          {
            name: 'Input2',
            properties: {},
            loc,
            comments
          }
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
                loc
              }
            },
            loc,
            comments
          },
          {
            name: 'RpcService2',
            interfaces: {
              a: {
                inputParams: [{ type: 'Input2', name: 'req', index: 2 }],
                returnType: 'common.Output2',
                comments: [],
                loc
              }
            },
            comments,
            loc
          }
        ]
      },
      {
        '/life/common': {
          ns: 'life.common'
        }
      }
    );
    expect(rtn).to.be.eq(
      `// prettier-ignore
export interface RpcService1 {
  a(req: l6.Input1): Promise<life.common.Output1>; // comment1
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
});

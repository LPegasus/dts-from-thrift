import { expect } from 'chai';
import * as path from 'path';
import { RpcEntity } from '../../src/interfaces';
import {
  printEnums,
  printInterfaces,
  printTypeDefs,
  fixIncludeNamespace,
  printServices,
  printCollectionRpc
} from '../../src/thrift/print';
import { readCode } from '../../src/thriftNew';

describe('thrift - print', () => {
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
            comment: '所有'
          },
          SKU: {
            value: 1,
            comment: 'SKU'
          }
        }
      },
      {
        name: 'Gender',
        properties: {
          F: {
            value: 0,
            comment: 'female'
          },
          M: {
            value: 1,
            comment: 'male'
          },
          UN: {
            value: 3,
            comment: 'UNKNOWN'
          },
          H: {
            value: 4,
            comment: 'half'
          }
        }
      }
    ],
    typeDefs: [
      {
        alias: 'CollectionResponse',
        type: 'Collection'
      },
      {
        alias: 'CollectionRequest',
        type: 'Collection'
      }
    ],
    includes: [],
    interfaces: [
      {
        childrenInterfaces: [],
        childrenEnums: [],
        name: 'BizRequest',
        properties: {
          biz_type: {
            type: 'BizType',
            comment: '',
            index: 0,
            optional: false,
            defaultValue: '3'
          },
          biz_id: {
            type: 'string',
            comment: 'biz id',
            index: 1,
            optional: false,
            defaultValue: '"3"'
          },
          biz_ext: {
            type: 'any',
            comment: '66666',
            index: 2,
            optional: true,
            defaultValue: ''
          }
        }
      }
    ]
  };
  it('enum print success', () => {
    expect(printEnums(entity)).to.deep.eq(
      `  export const enum BizType {
    ALL = 0,    // 所有
    SKU = 1     // SKU
  }

  export const enum Gender {
    F = 0,      // female
    M = 1,      // male
    UN = 3,     // UNKNOWN
    H = 4       // half
  }

`
    );
  });

  it('interface print success', () => {
    expect(printInterfaces(entity)).to.deep.eq(
      `  export interface BizRequest {
    biz_type: BizType;      // (default: 3)
    biz_id: string;         // biz id (default: "3")
    biz_ext?: any;          // 66666
  }

`
    );
  });

  it('typedef print success', () => {
    expect(printTypeDefs(entity)).to.deep.eq(
      `  export type CollectionResponse = Collection;
  export type CollectionRequest = Collection;

`
    );
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
      `interface interface1 {\n  data: list<life.api_feed.feedData[]>;\n}\n`
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
    expect(
      printServices(
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
              childrenInterfaces: [],
              childrenEnums: []
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
                  comment: 'comment1'
                }
              }
            },
            {
              name: 'RpcService2',
              interfaces: {
                a: {
                  inputParams: [{ type: 'Input2', name: 'req2', index: 1 }],
                  returnType: 'Output2',
                  comment: ''
                }
              }
            }
          ]
        },
        true
      )
    ).to.eq(`  export interface RpcService1 {
    a(req1: test.Input1, req2: Input2): Promise<Output1>;   // comment1
  }

  export interface RpcService2 {
    a(req2: Input2): Promise<Output2>;
  }

`);
  });

  it('printCollectionRpc success', () => {
    const rtn = printCollectionRpc(
      {
        ns: 'l6',
        interfaces: [],
        typeDefs: [
          {
            alias: 'Input1',
            type: '_Input1'
          }
        ],
        enums: [
          {
            name: 'Input2',
            properties: {}
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
                comment: 'comment1'
              }
            }
          },
          {
            name: 'RpcService2',
            interfaces: {
              a: {
                inputParams: [{ type: 'Input2', name: 'req', index: 2 }],
                returnType: 'common.Output2',
                comment: ''
              }
            }
          }
        ]
      },
      {
        '/life/common': {
          ns: 'life.common'
        }
      }
    );
    expect(rtn).to.be.eq(`  export interface RpcService1 {
    a(req: l6.Input1): Promise<life.common.Output1>; // comment1
  }

  export interface RpcService2 {
    a(req: l6.Input2): Promise<life.common.Output2>;
  }

`);
  });

  it('print empty service param interface', async () => {
    const rtn = await readCode(
      path.join(__dirname, 'examples', 'service.thrift')
    );
    expect(printServices(rtn).indexOf('WebFake()') !== -1).to.eq(true);
  });
});

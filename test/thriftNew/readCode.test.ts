import { expect } from 'chai';
import * as path from 'path';
import { readCode, parser } from '../../src/thriftNew';
import { RpcEntity } from '../../src/interfaces';

describe('thrift - read code file', () => {
  it('ThriftEntity with no error', async () => {
    const res = await readCode(
      path.resolve(__dirname, './examples/client.thrift')
    );
    expect(res).has.ownProperty('ns');
    expect(res).has.ownProperty('fileName');
    expect(res).has.ownProperty('includes');
    expect(res.includes[0]).to.eq('./common/pack_goods.thrift');
    expect(res.ns).to.eq('life.api_favorite');
    const expectResult = [
      {
        childrenEnums: [],
        childrenInterfaces: [],
        name: 'Collection',
        properties: {
          biz_type: {
            type: 'BizType',
            optional: true,
            comment: '',
            index: 1,
            defaultValue: ''
          },
          biz_id: {
            type: 'string',
            optional: true,
            comment: '',
            index: 2,
            defaultValue: ''
          },
          sku_collection: {
            type: 'pack_goods.ExtensiveGoodsItem',
            optional: true,
            comment: '',
            index: 3,
            defaultValue: ''
          }
        }
      },
      {
        name: 'FetchFavoriteRequest',
        childrenEnums: [],
        childrenInterfaces: [],
        properties: {
          biz_type: {
            type: 'BizType',
            index: 1,
            comment: '',
            optional: true,
            defaultValue: ''
          },
          offset: {
            type: 'Int64',
            index: 2,
            comment: '',
            optional: true,
            defaultValue: ''
          },
          count: {
            type: 'Int64',
            comment: '',
            optional: true,
            index: 3,
            defaultValue: ''
          },
          user_id: {
            type: 'Int64',
            comment: '',
            optional: true,
            index: 4,
            defaultValue: ''
          }
        }
      },
      {
        name: 'FetchFavoriteResponse',
        childrenEnums: [],
        childrenInterfaces: [],
        properties: {
          favorite: {
            type: 'Collection[]',
            index: 1,
            comment: '',
            optional: true,
            defaultValue: ''
          },
          has_more: {
            type: 'boolean',
            optional: true,
            comment: '',
            index: 2,
            defaultValue: ''
          },
          offset: {
            type: 'Int64',
            comment: '',
            index: 3,
            optional: true,
            defaultValue: ''
          }
        }
      },
      {
        name: 'CollectRequest',
        childrenEnums: [],
        childrenInterfaces: [],
        properties: {
          biz_type: {
            type: 'BizType',
            optional: true,
            comment: '',
            index: 1,
            defaultValue: ''
          },
          biz_id: {
            type: 'string',
            optional: true,
            comment: '',
            index: 2,
            defaultValue: ''
          },
          collect: {
            type: 'boolean',
            index: 3,
            comment: '',
            optional: true,
            defaultValue: ''
          }
        }
      }
    ];
    expect(res.interfaces[0]).to.deep.eq(expectResult[0]);
    expect(res.interfaces[1]).to.deep.eq(expectResult[1]);
    expect(res.interfaces[2]).to.deep.eq(expectResult[2]);
    expect(res.interfaces[3]).to.deep.eq(expectResult[3]);
    expect(res.enums).to.deep.eq([
      {
        name: 'BizType',
        properties: {
          ALL: {
            value: 0,
            comment: ''
          },
          GOODS: {
            value: 1,
            comment: ''
          }
        }
      }
    ]);
    expect(res.typeDefs).to.deep.eq([
      {
        alias: 'CollectResponse',
        type: 'Collection'
      }
    ]);
    expect(res.services).to.deep.eq([
      {
        name: 'CircleService',
        interfaces: {
          PackTag: {
            inputParams: [{ type: 'PackTagRequest', index: 1, name: 'req' }],
            returnType: 'PackTagResponse',
            comment: ''
          },
          GetTagIdByNames: {
            returnType: 'GetTagIdByNamesResponse',
            inputParams: [
              { type: 'GetTagIdByNamesRequest', index: 1, name: 'req' }
            ],
            comment: ''
          }
        }
      }
    ] as RpcEntity['services']);
  });

  it('func struct block with multiline comments pass', async () => {
    const rtn = await readCode(
      path.join(__dirname, 'examples', 'service.thrift')
    );
    expect(Object.keys(rtn.services[0].interfaces).length).to.eq(3);
  });

  it('invalid format', async () => {
    try {
      const subjects = parser(
        'he',
        `struct PublishRequest {
        1: required string name    // 包名称`
      );
    } catch (e) {
      expect(e.toString()).contain('thrift parser error:he');
    }
  });

  it('support option.useStrict', async () => {
    const thirftCode = `
    struct Collection {
      1: optional BizType biz_type,
      2: string biz_id,
      3: optional pack_goods.ExtensiveGoodsItem sku_collection,
  }
    `;
    const res = await parser('', thirftCode, { useStrictMode: false });
    const res2 = await parser('', thirftCode, { useStrictMode: true });
    expect(res.interfaces[0].properties.biz_type.optional).to.eq(true);
    expect(res.interfaces[0].properties.biz_id.optional).to.eq(false);
    expect(res2.interfaces[0].properties.biz_type.optional).to.eq(true);
    expect(res2.interfaces[0].properties.biz_type.optional).to.eq(true);
  });

  it('support option.useTag', async () => {
    const res = await readCode(
      path.resolve(__dirname, './examples/client.thrift'),
      {
        useTag: 'go'
      }
    );
    const res2 = await readCode(
      path.resolve(__dirname, './examples/client.thrift'),
      {
        useTag: 'js'
      }
    );
    expect(res.interfaces[0].properties.biz_type_go).not.eq(undefined);
    expect(res2.interfaces[0].properties.biz_type_go).eq(undefined);
  });
});

import { expect } from 'chai';
import * as path from 'path';
import { readCode, isStructStart } from '../../src/thrift/readCode';
import { RpcEntity } from '../../src/interfaces';

describe('thrift - read code file', () => {
  it('ThriftEntity with no error', async () => {
    const res = await readCode(
      path.resolve(__dirname, './examples/client.thrift')
    );
    expect(res).has.ownProperty('ns');
    expect(res).has.ownProperty('fileName');
    expect(res).has.ownProperty('includes');
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
            type: 'number',
            index: 2,
            comment: '',
            optional: true,
            defaultValue: ''
          },
          count: {
            type: 'number',
            comment: '',
            optional: true,
            index: 3,
            defaultValue: ''
          },
          user_id: {
            type: 'number',
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
            comment: '是否种草',
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
            type: 'number',
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
            comment: '商品'
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
            inputType: 'PackTagRequest',
            returnType: 'PackTagResponse',
            comment: ''
          },
          GetTagIdByNames: {
            returnType: 'GetTagIdByNamesResponse',
            inputType: 'GetTagIdByNamesRequest',
            comment: ''
          }
        }
      }
    ] as RpcEntity['services']);
  });

  it('func isStructStart pass', () => {
    expect(isStructStart('struct StructName{')).to.be.true;
    expect(isStructStart('struct StructName  {')).to.be.true;
    expect(isStructStart('  struct StructName  {')).to.be.true;
    expect(isStructStart('struct StructName')).to.be.false;
  });

  it('func struct block with multiline comments pass', async () => {
    const rtn = await readCode(path.join(__dirname, 'examples', 'service.thrift'));
    expect(Object.keys(rtn.services[0].interfaces).length).to.eq(3);
  });

  it.skip('__trouble_shoot__', async () => {
    console.log(
      await readCode(path.join(__dirname, 'examples/test1.thrift'))
    );
  });
});

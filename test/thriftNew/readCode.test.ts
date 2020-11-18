import { expect } from 'chai';
import * as path from 'path';
import { readCode, parser } from '../../src/thriftNew';
import { RpcEntity } from '../../src/thriftNew/interfaces';

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
        name: 'Collection',
        properties: {
          biz_type: {
            type: 'BizType',
            index: 1,
            optional: true,
            defaultValue: '',
            comments: [],
            commentsBefore: [],
            commentsAfter: [],
            loc: {
              start: { line: 11, column: 5, index: 177 },
              end: { line: 11, column: 66, index: 238 },
            },
          },
          biz_id: {
            type: 'string',
            index: 2,
            optional: true,
            defaultValue: '',
            comments: [],
            commentsBefore: [],
            commentsAfter: [],
            loc: {
              start: { line: 12, column: 5, index: 243 },
              end: { line: 12, column: 31, index: 269 },
            },
          },
          sku_collection: {
            type: 'pack_goods.ExtensiveGoodsItem',
            index: 3,
            optional: true,
            defaultValue: '',
            comments: [],
            commentsBefore: [],
            commentsAfter: [],
            loc: {
              start: { line: 13, column: 5, index: 274 },
              end: { line: 13, column: 62, index: 331 },
            },
          },
          list: {
            type: 'string[]',
            index: 4,
            optional: true,
            defaultValue: '',
            comments: [],
            commentsBefore: [],
            commentsAfter: [],
            loc: {
              start: { line: 14, column: 5, index: 336 },
              end: { line: 14, column: 34, index: 365 },
            },
          },
        },
        loc: {
          start: { line: 10, column: 1, index: 153 },
          end: { line: 15, column: 2, index: 367 },
        },
        comments: [
          {
            type: 'CommentLine',
            value: '商品',
            loc: {
              start: { line: 7, column: 18, index: 145 },
              end: { line: 7, column: 22, index: 149 },
            },
          },
        ],
        commentsAfter: [],
        commentsBefore: [],
      },
      {
        name: 'FetchFavoriteRequest',
        properties: {
          biz_type: {
            type: 'BizType',
            index: 1,
            optional: true,
            defaultValue: '',
            comments: [],
            commentsBefore: [],
            commentsAfter: [],
            loc: {
              start: { line: 20, column: 5, index: 437 },
              end: { line: 20, column: 34, index: 466 },
            },
          },
          offset: {
            type: 'Int64',
            index: 2,
            optional: true,
            defaultValue: '',
            comments: [],
            commentsBefore: [],
            commentsAfter: [],
            loc: {
              start: { line: 21, column: 5, index: 471 },
              end: { line: 21, column: 28, index: 494 },
            },
          },
          count: {
            type: 'Int64',
            index: 3,
            optional: true,
            defaultValue: '',
            comments: [],
            commentsBefore: [],
            commentsAfter: [],
            loc: {
              start: { line: 22, column: 5, index: 499 },
              end: { line: 22, column: 27, index: 521 },
            },
          },
          user_id: {
            type: 'Int64',
            index: 4,
            optional: true,
            defaultValue: '',
            comments: [],
            commentsBefore: [],
            commentsAfter: [],
            loc: {
              start: { line: 23, column: 5, index: 526 },
              end: { line: 23, column: 29, index: 550 },
            },
          },
        },
        loc: {
          start: { line: 19, column: 1, index: 403 },
          end: { line: 24, column: 2, index: 552 },
        },
        comments: [
          {
            type: 'CommentLine',
            value: '@method: GET',
            loc: {
              start: { line: 17, column: 1, index: 369 },
              end: { line: 17, column: 16, index: 384 },
            },
          },
          {
            type: 'CommentLine',
            value: '@brief: 获取收藏清单',
            loc: {
              start: { line: 18, column: 1, index: 385 },
              end: { line: 18, column: 18, index: 402 },
            },
          },
        ],
        commentsAfter: [],
        commentsBefore: [
          {
            type: 'CommentLine',
            value: '@method: GET',
            loc: {
              start: { line: 17, column: 1, index: 369 },
              end: { line: 17, column: 16, index: 384 },
            },
          },
          {
            type: 'CommentLine',
            value: '@brief: 获取收藏清单',
            loc: {
              start: { line: 18, column: 1, index: 385 },
              end: { line: 18, column: 18, index: 402 },
            },
          },
        ],
      },
      {
        name: 'FetchFavoriteResponse',
        properties: {
          favorite: {
            type: 'Collection[]',
            index: 1,
            optional: true,
            defaultValue: '',
            comments: [],
            commentsBefore: [],
            commentsAfter: [
              {
                type: 'CommentLine',
                value: '是否种草',
                loc: {
                  start: { line: 42, column: 45, index: 862 },
                  end: { line: 42, column: 52, index: 869 },
                },
              },
            ],
            loc: {
              start: { line: 42, column: 5, index: 822 },
              end: { line: 42, column: 43, index: 860 },
            },
          },
          has_more: {
            type: 'boolean',
            index: 2,
            optional: true,
            defaultValue: '',
            comments: [
              {
                type: 'CommentLine',
                value: '是否种草',
                loc: {
                  start: { line: 42, column: 45, index: 862 },
                  end: { line: 42, column: 52, index: 869 },
                },
              },
            ],
            commentsBefore: [],
            commentsAfter: [],
            loc: {
              start: { line: 43, column: 5, index: 874 },
              end: { line: 43, column: 31, index: 900 },
            },
          },
          offset: {
            type: 'Int64',
            index: 3,
            optional: true,
            defaultValue: '',
            comments: [],
            commentsBefore: [],
            commentsAfter: [],
            loc: {
              start: { line: 44, column: 5, index: 905 },
              end: { line: 44, column: 28, index: 928 },
            },
          },
        },
        loc: {
          start: { line: 41, column: 1, index: 787 },
          end: { line: 45, column: 2, index: 930 },
        },
        comments: [
          {
            type: 'CommentBlock',
            value: [
              '@method: POST',
              'enum SegmentLabelType {',
              ' Reserved = 0,',
              ' Text = 1,  // 纯文本',
              '}',
              '',
              'enum SegmentCardType{',
              ' Reserved = 0',
              ' CoverCard = 1 // 最多允许输入27个字符',
              ' FullScreenDescCard = 2 //全屏描述',
              ' BottomDescCard = 3 //底tab卡片描述',
              '}',
            ],
            loc: {
              start: { line: 26, column: 1, index: 554 },
              end: { line: 39, column: 4, index: 785 },
            },
          },
        ],
        commentsAfter: [],
        commentsBefore: [
          {
            type: 'CommentBlock',
            value: [
              '@method: POST',
              'enum SegmentLabelType {',
              ' Reserved = 0,',
              ' Text = 1,  // 纯文本',
              '}',
              '',
              'enum SegmentCardType{',
              ' Reserved = 0',
              ' CoverCard = 1 // 最多允许输入27个字符',
              ' FullScreenDescCard = 2 //全屏描述',
              ' BottomDescCard = 3 //底tab卡片描述',
              '}',
            ],
            loc: {
              start: { line: 26, column: 1, index: 554 },
              end: { line: 39, column: 4, index: 785 },
            },
          },
        ],
      },
      {
        name: 'CollectRequest',
        properties: {
          biz_type: {
            type: 'BizType',
            index: 1,
            optional: true,
            defaultValue: '',
            comments: [],
            commentsBefore: [],
            commentsAfter: [],
            loc: {
              start: { line: 53, column: 5, index: 1035 },
              end: { line: 53, column: 105, index: 1135 },
            },
          },
          biz_id: {
            type: 'string',
            index: 2,
            optional: true,
            defaultValue: '',
            comments: [],
            commentsBefore: [],
            commentsAfter: [],
            loc: {
              start: { line: 54, column: 5, index: 1140 },
              end: { line: 54, column: 31, index: 1166 },
            },
          },
          collect: {
            type: 'boolean',
            index: 3,
            optional: true,
            defaultValue: '',
            comments: [],
            commentsBefore: [],
            commentsAfter: [],
            loc: {
              start: { line: 55, column: 5, index: 1171 },
              end: { line: 55, column: 30, index: 1196 },
            },
          },
        },
        loc: {
          start: { line: 51, column: 1, index: 1007 },
          end: { line: 56, column: 2, index: 1198 },
        },
        comments: [
          {
            type: 'CommentLine',
            value: '@url: life/client/favorite/collect',
            loc: {
              start: { line: 47, column: 1, index: 932 },
              end: { line: 47, column: 38, index: 969 },
            },
          },
          {
            type: 'CommentLine',
            value: '@method: POST',
            loc: {
              start: { line: 48, column: 1, index: 970 },
              end: { line: 48, column: 17, index: 986 },
            },
          },
          {
            type: 'CommentLine',
            value: '@brief: 新增/删除收藏',
            loc: {
              start: { line: 49, column: 1, index: 987 },
              end: { line: 49, column: 19, index: 1005 },
            },
          },
        ],
        commentsAfter: [],
        commentsBefore: [
          {
            type: 'CommentLine',
            value: '@url: life/client/favorite/collect',
            loc: {
              start: { line: 47, column: 1, index: 932 },
              end: { line: 47, column: 38, index: 969 },
            },
          },
          {
            type: 'CommentLine',
            value: '@method: POST',
            loc: {
              start: { line: 48, column: 1, index: 970 },
              end: { line: 48, column: 17, index: 986 },
            },
          },
          {
            type: 'CommentLine',
            value: '@brief: 新增/删除收藏',
            loc: {
              start: { line: 49, column: 1, index: 987 },
              end: { line: 49, column: 19, index: 1005 },
            },
          },
        ],
      },
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
            loc: {
              start: { line: 6, column: 5, index: 119 },
              end: { line: 6, column: 12, index: 126 },
            },
            comments: [],
            commentsBefore: [],
            commentsAfter: [],
          },
          GOODS: {
            value: 1,
            loc: {
              start: { line: 7, column: 5, index: 132 },
              end: { line: 7, column: 14, index: 141 },
            },
            comments: [],
            commentsBefore: [],
            commentsAfter: [
              {
                type: 'CommentLine',
                value: '商品',
                loc: {
                  start: { line: 7, column: 18, index: 145 },
                  end: { line: 7, column: 22, index: 149 },
                },
              },
            ],
          },
        },
        loc: {
          start: { line: 5, column: 1, index: 100 },
          end: { line: 8, column: 2, index: 151 },
        },
        comments: [],
        commentsBefore: [],
        commentsAfter: [],
      },
    ]);
    expect(res.typeDefs).to.deep.eq([
      {
        type: 'Collection',
        alias: 'CollectResponse',
        comments: [],
        commentsAfter: [],
        commentsBefore: [],
        loc: {
          start: { line: 63, column: 1, index: 1371 },
          end: { line: 63, column: 35, index: 1405 },
        },
      },
    ]);
    expect(res.services).to.deep.eq([
      {
        name: 'CircleService',
        interfaces: {
          PackTag: {
            returnType: 'PackTagResponse',
            inputParams: [{ type: 'PackTagRequest', index: 1, name: 'req' }],
            comments: [],
            loc: {
              start: { line: 58, column: 5, index: 1227 },
              end: { line: 58, column: 68, index: 1290 },
            },
            commentsBefore: [],
            commentsAfter: [],
          },
          GetTagIdByNames: {
            returnType: 'GetTagIdByNamesResponse',
            inputParams: [
              { type: 'GetTagIdByNamesRequest', index: 1, name: 'req' },
            ],
            comments: [],
            loc: {
              start: { line: 59, column: 5, index: 1295 },
              end: { line: 59, column: 76, index: 1366 },
            },
            commentsBefore: [],
            commentsAfter: [],
          },
        },
        comments: [],
        commentsAfter: [],
        commentsBefore: [],
        loc: {
          start: { line: 57, column: 1, index: 1199 },
          end: { line: 60, column: 2, index: 1368 },
        },
      },
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
        1: required string name    // 包名称
        }`
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
    const res = parser('', thirftCode, { useStrictMode: false });
    const res2 = parser('', thirftCode, { useStrictMode: true });
    expect(res.interfaces[0].properties.biz_type.optional).to.eq(true);
    expect(res.interfaces[0].properties.biz_id.optional).to.eq(false);
    expect(res2.interfaces[0].properties.biz_type.optional).to.eq(true);
    expect(res2.interfaces[0].properties.biz_type.optional).to.eq(true);
  });

  it('support option.useTag', async () => {
    const res = await readCode(
      path.resolve(__dirname, './examples/client.thrift'),
      {
        useTag: 'go',
        annotationConfig: {},
      }
    );
    const res2 = await readCode(
      path.resolve(__dirname, './examples/client.thrift'),
      {
        useTag: 'js',
        annotationConfig: {},
      }
    );
    expect(res.interfaces[0].properties.biz_type_go).not.eq(undefined);
    expect(res2.interfaces[0].properties.biz_type_go).eq(undefined);
  });

  it('support annotation config', async () => {
    const thirftCode = `
    struct Collection {
      1: optional BizType biz_type (source = 'query',   key = 'bizType'),
      3: optional pack_goods.ExtensiveGoodsItem sku_collection,
    }
    service CollectService {
      Collection Collect(1:i32 req)  (method = 'GET',  uri = '/api/collect'),
      Collection Collect2(1:i32 req)  (api.get = '/api/collect2'),
    }
      `;
    const res = parser('', thirftCode, {
      annotationConfig: {
        fieldKey: 'key',
        fieldComment: ['source', 'api.get', 'api.post'],
        functionMethod: 'method',
        functionUri: 'uri',
      },
    });
    // 正确的根据key修改变量命名
    expect(res.interfaces[0].properties['bizType'].index).to.eq(1);
    // 正确的处理额外的注释
    expect(
      res.interfaces[0].properties['bizType'].commentsBefore![0].value
    ).to.eq('@source:query    ');
    // 正确的处理method uri, 末尾的空格在prettier中处理
    expect(
      res.services[0].interfaces['Collect'].commentsBefore![0].value
    ).to.eq('@method: GET    @uri: /api/collect    ');
    expect(
      res.services[0].interfaces['Collect2'].commentsBefore![0].value
    ).to.eq('@api.get: /api/collect2    ');
  });

  it('support default value', async () => {
    const thirftCode = `
      struct Collection {
        1: optional Collection collection = Collection,
        2: optional i32 i32_val = 32,
        3: optional bool bool_val = false,
        4: optional double double_val = 3.15926,
        5: optional string string_val = 'hello world',
        6: optional map<string, string> map_val = {'hello': 'world'},
        7: optional list<i64> list_val = [1,2,3,4],
    }
      `;
    const res = parser('', thirftCode);
    const collectionObj = res.interfaces[0].properties;
    expect(collectionObj.collection.commentsBefore![0].value).to.eq(
      '@default: Collection'
    );
    expect(collectionObj.i32_val.commentsBefore![0].value).to.eq(
      '@default: 32'
    );
    expect(collectionObj.bool_val.commentsBefore![0].value).to.eq(
      '@default: false'
    );
    expect(collectionObj.double_val.commentsBefore![0].value).to.eq(
      '@default: 3.15926'
    );
    expect(collectionObj.string_val.commentsBefore![0].value).to.eq(
      '@default: hello world'
    );
    expect(collectionObj.map_val.commentsBefore![0].value).to.eq(
      '@default: Map'
    );
    expect(collectionObj.list_val.commentsBefore![0].value).to.eq(
      '@default: List'
    );
  });

  it('parse namespace', async () => {
    const thirftCodeJS = `
      namespace js xx
      namespace go zz
      namespace python yy
      `;
    const thirftCodeJSSecond = `
      namespace go zz
      namespace js xx
      namespace python yy
      `;
    const thirftCodeGo = `
      namespace go zz
      namespace python yy
      `;
    const thirftCodePy = `
      namespace python yy
      `;
    const thirftCodeNull = `
    include "hello.thrift"
      `;
    const res1 = parser('', thirftCodeJS);
    const res2 = parser('', thirftCodeJSSecond);
    const res3 = parser('', thirftCodeGo);
    const res4 = parser('', thirftCodePy);
    const res5 = parser('', thirftCodeNull);

    expect(res1.ns).to.eq('xx');
    expect(res2.ns).to.eq('xx');
    expect(res3.ns).to.eq('zz');
    expect(res4.ns).to.eq('yy');
    expect(res5.ns).to.eq(undefined);
  });

  it('support strict response', async () => {
    const thirftCodeJS = `
      struct CollectionResponse {
        1: required i64 collection,
        1: i64 collection1,
        1: optional i64 collection2,
        1: required i64 collectionD = 1,
        1: i64 collectionD1 = 1,
        1: optional i64 collectionD2 = 1,
      }
      struct CollectionRequest {
        1: required i64 collection,
        1: i64 collection1,
        1: optional i64 collection2,
        1: required i64 collectionD = 1,
        1: i64 collectionD1 = 1,
        1: optional i64 collectionD2 = 1,
      }
      struct Collection {
        1: required i64 collection,
        1: i64 collection1,
        1: optional i64 collection2,
        1: required i64 collectionD = 1,
        1: i64 collectionD1 = 1,
        1: optional i64 collectionD2 = 1,
      }
      `;
    /**
     * 影响optional的元素
     * - required/optional/无前缀
     * - default value
     * - 处于request/reponse的结构体中
     */
    const res1 = parser('', thirftCodeJS, {
      strictReq: true,
    });
    const collectionResponse = res1.interfaces[0].properties;
    const collectionRequest = res1.interfaces[1].properties;
    const collection = res1.interfaces[2].properties;
    expect(collectionResponse.collection.optional).to.eq(false);
    expect(collectionResponse.collection1.optional).to.eq(false);
    expect(collectionResponse.collection2.optional).to.eq(true);
    expect(collectionResponse.collectionD.optional).to.eq(false);
    expect(collectionResponse.collectionD1.optional).to.eq(false);
    expect(collectionResponse.collectionD2.optional).to.eq(true);
    expect(collectionRequest.collection.optional).to.eq(false);
    expect(collectionRequest.collection1.optional).to.eq(true);
    expect(collectionRequest.collection2.optional).to.eq(true);
    expect(collectionRequest.collectionD.optional).to.eq(false);
    expect(collectionRequest.collectionD1.optional).to.eq(true);
    expect(collectionRequest.collectionD2.optional).to.eq(true);
    expect(collection.collection.optional).to.eq(false);
    expect(collection.collection1.optional).to.eq(false);
    expect(collection.collection2.optional).to.eq(true);
    expect(collection.collectionD.optional).to.eq(false);
    expect(collection.collectionD1.optional).to.eq(true);
    expect(collection.collectionD2.optional).to.eq(true);
  });

  it('support i64 as string', async () => {
    const thirftCodeJS = `
      namespace js xx
      struct X {
        1: optional list<i64> myList,
        1: optional i64 myI64,
        1: optional map<i64, i64> myMap,
        1: optional set<i64> mySet,
        1: optional i32 myI32,
      }
      `;

    const res = parser('', thirftCodeJS, { i64Type: 'Int64' });
    const struct = res.interfaces[0].properties;

    expect(struct.myList.type).to.eq('Int64[]');
    expect(struct.myI64.type).to.eq('Int64');
    expect(struct.myMap.type).to.eq('Map<Int64, Int64>');
    expect(struct.mySet.type).to.eq('Set<Int64>');
    expect(struct.myI32.type).to.eq('number');
  });

  it('support numerical constant and string constant', async () => {
    const thirftCodeJS = `
      namespace js xx
      const i32 C32 = 1234;
      const i64 C64 = 12345678;
      const double CDouble = 1e3;
      const string CString = '123123';
      const map<string,string> CMap = {"hello": "world", "goodnight": "moon"};
      const list<string> CList = ['hello', 'world'];
      `;

    const res = parser('', thirftCodeJS, { i64Type: 'string' });
    const consts = res.consts;

    expect(consts.length).to.equal(4);
    expect(consts[0].value).to.equal('1234');
    expect(consts[0].name).to.equal('C32');
    expect(consts[1].value).to.equal('12345678');
    expect(consts[2].value).to.equal('1e3');
    expect(consts[3].value).to.equal('123123');
  });

  it('support map as record', async () => {
    const thirftCodeJS = `
      namespace js xx
      struct X {
        1: optional map<i64, i64> myMap,
      }
      `;

    const res = parser('', thirftCodeJS, {
      mapType: 'Record',
    });
    const struct = res.interfaces[0].properties;

    expect(struct.myMap.type).to.eq('Record<string, Int64>');
  });
});

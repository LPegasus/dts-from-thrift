import { expect } from 'chai';
import { parseStruct, preProcessCode } from '../../src/thrift/parseStruct';
import { printInterfaces } from '../../src/thrift/print';

describe('thrift - parse struct', () => {
  it('parse struct block success', () => {
    const blocks = [
      'struct ModifyUserRequest{',
      '0: optional map<list<byte>, set<pack_common.item>> dummy,  ',
      '  1: required i64 user_id = -1,   // 用户 id',
      '  2: optional pack_user.UserLevel level= "top", # 级别',
      '  3: optional list<string> remark(go.tag="json:\\"expires\\" example_data:\\"604800\\"") = \'\',   /// 备注',
      '  4: pack_user.UserType user_type(go.tag="json:\\"expires\\" example_data:\\"604800\\"")    ##用户类型',
      '}'
    ];
    const iLog = parseStruct(blocks);

    expect(iLog).to.deep.eq({
      name: 'ModifyUserRequest',
      childrenEnums: [],
      childrenInterfaces: [],
      properties: {
        dummy: {
          optional: true,
          type: 'Map<number[], Set<pack_common.item>>',
          comment: '',
          index: 0,
          defaultValue: ''
        },
        user_id: {
          optional: false,
          type: 'Int64',
          comment: '用户 id',
          index: 1,
          defaultValue: '-1'
        },
        level: {
          type: 'pack_user.UserLevel',
          optional: false,
          comment: '级别',
          index: 2,
          defaultValue: '"top"'
        },
        remark: {
          type: 'string[]',
          index: 3,
          comment: '备注',
          optional: false,
          defaultValue: "''"
        },
        user_type: {
          optional: false,
          type: 'pack_user.UserType',
          comment: '用户类型',
          index: 4,
          defaultValue: ''
        }
      }
    });
  });

  it('strict mode test should pass', () => {
    const blocks = [
      'struct ModifyUserRequest{',
      '0: optional map<list<byte>, set<pack_common.item>> dummy,  ',
      '  1: required i64 user_id = -1,   // 用户 id',
      '  2: optional pack_user.UserLevel level= "top", # 级别',
      '  3: optional list<string> remark(go.tag="json:\\"expires\\" example_data:\\"604800\\"") = \'\',   /// 备注',
      '  4: pack_user.UserType user_type (go.tag="json:\\"expires\\" example_data:\\"604800\\"")    ##用户类型',
      '}'
    ];
    const iLog2 = parseStruct(blocks, { useStrictMode: true });

    expect(iLog2.properties.user_type.optional).to.be.true;
  });

  it('default value should be parsed success', () => {
    const blocks = [
      'struct ModifyUserRequest{',
      '0: optional map<list<byte>, set<pack_common.item>> dummy,  ',
      '  1: required i64 user_id = "",   // 用户 id',
      '  2: optional pack_user.UserLevel level = 1, # 级别',
      '  3: optional list<string> remark(go.tag="json:\\"expires\\" example_data:\\"604800\\""),   /// 备注',
      '  4: optional pack_user.UserType user_type(go.tag="json:\\"expires\\" example_data:\\"604800\\"")    ##用户类型',
      '}'
    ];

    const res = parseStruct(blocks);
    const keys = Object.keys(res.properties);
    expect(
      keys.filter(d => {
        // console.log(res.properties[d].defaultValue);
        return !!res.properties[d].defaultValue;
      }).length
    ).to.be.eq(2);

    expect(res.properties.user_id.defaultValue).to.be.eq('""');
    expect(res.properties.level.defaultValue).to.be.eq('1');
  });

  it('struct with whitespace before', () => {
    const blocks = [
      ' struct ModifyUserRequest{ ',
      '0: optional map<list<byte>, set<pack_common.item>> dummy,  ',
      '  1: required i64 user_id = "",   // 用户 id',
      '  2: optional pack_user.UserLevel level = 1, # 级别',
      '  3: optional list<string> remark(go.tag="json:\\"expires\\" example_data:\\"604800\\""),   /// 备注',
      '  4: optional pack_user.UserType user_type(go.tag="json:\\"expires\\" example_data:\\"604800\\"")    ##用户类型',
      '}'
    ];

    const res = parseStruct(blocks);
    const keys = Object.keys(res.properties);
    expect(
      keys.filter(d => {
        // console.log(res.properties[d].defaultValue);
        return !!res.properties[d].defaultValue;
      }).length
    ).to.be.eq(2);

    expect(res.properties.user_id.defaultValue).to.be.eq('""');
    expect(res.properties.level.defaultValue).to.be.eq('1');
  });

  it('struct with tag should replace field with tagname', () => {
    const blocks = [
      'struct ListTopicResponse{',
      '  1: i64 offset,',
      '  1: optional list<pack_comment.Comment> comments (go.tag="json:\\"list,omitempty\\" example_data:\\"\\""), // dddd',
      '  3: bool has_more,',
      '  4: i32 total',
      '}'
    ];

    const res = parseStruct(blocks, {
      useTag: 'go'
    });
    expect(res.properties.list.comment).to.be.eq('dddd');
    expect(res.properties.hasOwnProperty('comments')).to.be.eq(false);

    // 然后测试 useTag 不用的情况
    const res2 = parseStruct(blocks, {
      useTag: undefined
    });
    expect(res2.properties.comments.comment).to.be.eq('dddd');
    expect(res2.properties.hasOwnProperty('list')).to.be.eq(false);
  });

  it('struct with extra space should formatted', () => {
    const blocks = [
      '  struct GoodsBrand {    ',
      '    1: optional     string                  id,',
      '    2: optional     string                  name, //名字',
      '    6: optional     list<pack_common.Image> covers, //品牌图片',
      '}'
    ];
    const res = parseStruct(blocks);
    const output = printInterfaces({
      interfaces: [res]
    });
    output.split(/\n/g).forEach(d => {
      expect(
        /\s{2,}/.test(
          d
            .trim()
            .replace(/\/\/\s.+/, '')
            .trim()
        )
      ).to.be.eq(false);
    });
  });

  it('process pass', () => {
    const rtn = preProcessCode(
      'optional list<TopItem>top_item_list,//top_item_list,包含item_id, item_type'
    );
    expect(rtn).to.deep.eq({
      comment: 'top_item_list,包含item_id, item_type',
      lineWithoutComment:
        'optional list<TopItem> top_item_list,'
    });
  });

  it('process pass 2', () => {
    const rtn = preProcessCode('optional BizType biz_type(go.tag="json:\"url\" example_data:\"http://xx.aa.j/large/saaa.webp\""), // 666');
    expect(rtn).to.deep.eq({
      comment: '666',
      lineWithoutComment: 'optional BizType biz_type(go.tag="json:\"url\" example_data:\"http://xx.aa.j/large/saaa.webp\""),'
    })
  })
});

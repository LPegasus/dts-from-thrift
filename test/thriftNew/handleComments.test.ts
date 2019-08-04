import { expect } from 'chai';
import { handleComments } from '../../src/thriftNew/handleComments';
import {
  ThriftDocument,
  ServiceDefinition,
  parse
} from '../../src/thriftNew/@creditkarma/thrift-parser';

describe('thrift - handle comments', () => {
  const thriftFile = `
  /* xxxxxx */
  // comment0
  struct Collection {
    // comment1
    // comment2
    1: optional BizType biz_type (source = 'query',   key = 'bizType'), // comment3
    3: optional pack_goods.ExtensiveGoodsItem sku_collection,
}  // comment4
service CollectService {
  Collection Collect(1:i32 req)  (method = 'GET',  uri = '/api/collect'),/* zzzzz */ // comment6
}
// comment5
  `;

  it('hanle comments', async () => {
    const ast = parse(thriftFile);
    const astWithNewComments = handleComments(<ThriftDocument>ast);
    const astBody = astWithNewComments.body;

    // 最后的comment分配到手动添加的const语法变量上
    expect(astBody[0].commentsBefore!.length).to.eq(1);
    expect(astBody[0].commentsBefore![0].value).to.eq('comment5');

    // 在语法变量前面的元素属于该变量
    expect(astBody[1].commentsBefore!.length).to.eq(2);
    expect(astBody[1].commentsBefore![0].value[0]).to.eq('xxxxxx');
    expect(astBody[1].commentsBefore![1].value).to.eq('comment0');

    // 在语法变量后面的同一行元素属于该变量
    expect(astBody[1].commentsAfter!.length).to.eq(1);
    expect(astBody[1].commentsAfter![0].value).to.eq('comment4');
    expect(
      (astBody[2] as ServiceDefinition).functions[0].commentsAfter!.length
    ).to.eq(2);
    expect(
      (astBody[2] as ServiceDefinition).functions[0].commentsAfter![0].value[0]
    ).to.eq('zzzzz');
    expect(
      (astBody[2] as ServiceDefinition).functions[0].commentsAfter![1].value
    ).to.eq('comment6');
  });
});

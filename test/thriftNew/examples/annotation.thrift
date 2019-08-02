/* 
  @description some things head
 */
namespace go life.api_favorite


// a collection
struct Collection {
  // web
    1: optional BizType biz_type (source = 'query',   key = 'bizType'),
    // app
    3: optional pack_goods.ExtensiveGoodsItem sku_collection, /* @description zzzz*/ // test
}

/* 
  @description CollectService before
 */
service CollectService {
  Collection Collect(1:i32 req)  (method = 'GET',  uri = '/api/collect'),
} //   CollectService after
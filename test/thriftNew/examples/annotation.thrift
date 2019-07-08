namespace go life.api_favorite

struct Collection {
    1: optional BizType biz_type (source = 'query',   key = 'bizType'),
    3: optional pack_goods.ExtensiveGoodsItem sku_collection,
}
service CollectService {
  Collection Collect(1:i32 req)  (method = 'GET',  uri = '/api/collect'),
}
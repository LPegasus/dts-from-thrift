include "./common/pack_goods.thrift"
namespace go life.api_favorite
namespace py life.api_favorite

// test for enum sort
enum ZizType {
    ALL = 0,
    GOODS = 1,   //商品
}

enum BizType {
    ALL = 0,
    GOODS = 1,   //商品
}

enum AizType {
    GOODS = 1,   //商品
    ALL = 0,
}

struct Collection {
    1: optional BizType biz_type (go.tag="json:\"biz_type_go\""),
    2: optional string biz_id,
    3: optional pack_goods.ExtensiveGoodsItem sku_collection,
}

// @method: GET
// @brief: 获取收藏清单
struct FetchFavoriteRequest {
    1: optional BizType biz_type,
    2: optional i64 offset,
    3: optional i64 count,
    4: optional i64 user_id,
}

/**
 @method: POST
enum SegmentLabelType {
    Reserved = 0,
    Text = 1,  // 纯文本
}

enum SegmentCardType{
    Reserved = 0
    CoverCard = 1 // 最多允许输入27个字符
    FullScreenDescCard = 2 //全屏描述
    BottomDescCard = 3 //底tab卡片描述
}
**/

struct FetchFavoriteResponse {
    1: optional list<Collection> favorite,  // 是否种草
    2: optional bool has_more,
    3: optional i64 offset,
}

// @url: life/client/favorite/collect
// @method: POST
// @brief: 新增/删除收藏

struct CollectRequest
{
    1: optional BizType biz_type(go.tag="json:\"url\" example_data:\"http://xx.aa.j/large/saaa.webp\""),
    2: optional string biz_id,
    3: optional bool collect,
}

typedef Collection CollectResponse

const i32 C32 = 1234
const i64 C64 = 12345678
const double CDouble = 1e3
const string CString = '123123'
const map<string,string> CMap = {"hello": "world", "goodnight": "moon"}
const list<string> CList = ['hello', 'world']
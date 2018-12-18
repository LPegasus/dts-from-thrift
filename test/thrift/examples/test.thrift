struct MediaCrawlSeed {
        1: required i64 ID;
        2: required i64 MediaID;
        3: required i16 SeedType;
        4: required i16 Status;
        5: required string URL;
        6: required string ConfirmReason;
        7: required i64 CreateTime;
        8: required i64 VerifiedTime;
        9: required string AdminUser;
        10: required string UpdateStatus;
        11: required string Remark;
        12: required i16 Flags;
        13: required i64 ModifyTime;
        14: required i64 LastRunTime;
        15: required string RunStatus;
        16: required string Extra;

        17: optional string WeixinID;  #公众号名称
        18: optional string WeixinSrcID;  #微信号原始ID
	19: required i16 ConfirmReasonType;
}

struct PublishArticleRequest {
    1: required i64     ItemID; # 文章id(非0, 调用方生成id)
    2: required i64     MediaID;
    3: required i64     UserID;
    4: required i16     UserType; # 0 pgc, 1 ugc
    5: required string  Title; # 文章标题
    6: required string  Abstract; # 文章摘要
    7: required string  Content; # 文章内容
    8: required i64     Flags; # 扩展属性标志位
    9: required string  Extra; # 扩展属性 json
    10: required string  Tag; # 文章分类
    11: required i16    Save; # 0 草稿, 1 提交
    12: required i16    VerifyType; # 0 先审后发 1 先发后审
    13: required i16    Feature; # 文章类型, 0 普通,1视频,2直播
    14: required i16    Source; # 文章来源(业务方自定义) 0 mp后台 1 快马 2 第三方api
    15: optional i16    Slave; # 1 子标题（双标题）
    16: optional i16    ShowAds; # 广告类型
    17: optional i64    CreateTime; # 发文时间（一般不传，如果调用方需要指定发文时间，可以传该字段）

    255: optional base.Base Base;
}
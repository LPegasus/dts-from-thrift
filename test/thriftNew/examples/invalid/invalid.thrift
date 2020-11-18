namespace go demo.api.test
struct WebPostDetailResponse {
    1: i64 id
}
struct AppPostDetailResponse {
    1: i64 id
}
struct WebPostDetailRequest 
  1: i64 id
}
struct AppPostDetailRequest {
  1: i64 id
}
service ItemApi {
  WebPostDetailResponse   WebPostDetail(1:WebPostDetailRequest req) // web
  /*
   * comments
   */
  AppPostDetailResponse   AppPostDetail(1:AppPostDetailRequest req) // app
  WebPostDetailResponse   WebFake() throws(1:GroupNotFoundException ex);
}

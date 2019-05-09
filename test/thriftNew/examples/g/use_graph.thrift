namespace go use_graph

include "./graph.thrift"

struct RelationCountRequest{
    1:   optional i64graph.PointType point_type,
    2:   optional i64 id,
    3:   optional i64graph.EdgeType edge_type,
}

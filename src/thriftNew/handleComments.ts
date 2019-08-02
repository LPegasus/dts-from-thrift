import {
  ThriftDocument,
  SyntaxType,
  Comment,
  ServiceDefinition,
  StructLike,
  PrimarySyntax,
  EnumDefinition
} from './@creditkarma/thrift-parser';

export const collectCommentsAndPrimarySyntax = (
  ast: ThriftDocument
): {
  comments: Comment[];
  primarySyntaxNodes: PrimarySyntax[];
} => {
  const comments: Comment[] = [];
  const primarySyntaxNodes: PrimarySyntax[] = [];
  // 从这些内容里面获取comment用于重构
  const primarySyntaxType = [
    SyntaxType.IncludeDefinition,
    SyntaxType.ServiceDefinition,
    SyntaxType.FunctionDefinition,
    SyntaxType.NamespaceDefinition,
    SyntaxType.ConstDefinition,
    SyntaxType.TypedefDefinition,
    SyntaxType.EnumDefinition,
    SyntaxType.EnumMember,
    SyntaxType.StructDefinition,
    SyntaxType.UnionDefinition,
    SyntaxType.ExceptionDefinition,
    SyntaxType.FieldDefinition
  ];
  const hasChildrenType = [
    SyntaxType.ServiceDefinition,
    SyntaxType.EnumDefinition,
    SyntaxType.StructDefinition,
    SyntaxType.UnionDefinition,
    SyntaxType.ExceptionDefinition
  ];
  // 从单个元素中收集comments
  const collectSingleComments = (item: PrimarySyntax): void => {
    if (item.comments.length) {
      comments.push(...item.comments);
    }
  };
  ast.body.forEach(thriftStatement => {
    const type = thriftStatement.type;
    primarySyntaxNodes.push(thriftStatement);
    if (primarySyntaxType.includes(type)) {
      if (hasChildrenType.includes(type)) {
        switch (type) {
          case SyntaxType.ServiceDefinition:
            (thriftStatement as ServiceDefinition).functions.forEach(item => {
              // TODO: 考虑FunctionDefinition中包含的FieldDefinition的注释。。
              /**
               * 例如：
               * service CollectService {
               *     Collection Collect(
               *         1:i32 req // 奇怪的注释，感觉不想允许它的存在
               *     )  (method = 'GET',  uri = '/api/collect'),
               * }
               */
              collectSingleComments(item);
              primarySyntaxNodes.push(item);
            });
            break;
          case SyntaxType.EnumDefinition:
            (thriftStatement as EnumDefinition).members.forEach(item => {
              collectSingleComments(item);
              primarySyntaxNodes.push(item);
            });
            break;
          case SyntaxType.StructDefinition:
          case SyntaxType.UnionDefinition:
          case SyntaxType.ExceptionDefinition:
            (thriftStatement as StructLike).fields.forEach(item => {
              collectSingleComments(item);
              primarySyntaxNodes.push(item);
            });
            break;
        }
      }
      collectSingleComments(thriftStatement);
    }
  });
  return {
    comments: comments.sort((a, b) => a.loc.start.index - b.loc.start.index),
    // 有序之后做二分查找
    primarySyntaxNodes: primarySyntaxNodes.sort(
      (a, b) => a.loc.start.index - b.loc.start.index
    )
  };
};

export const handleComments = (ast: ThriftDocument): ThriftDocument => {
  const { comments, primarySyntaxNodes } = collectCommentsAndPrimarySyntax(ast);
  // 先把所有的primarySyntaxNodes初始化
  primarySyntaxNodes.forEach(node => {
    node.commentsBefore = [];
    node.commentsAfter = [];
  });
  // 配对O(n2) TODO: 优化到O(nlogn)，如果没有性能问题就不管了
  // 规则：
  // - line相同，比较index，comment.index > PrimarySyntax.index，
  //    认为是PrimarySyntax的commentsBefore，comment.index < PrimarySyntax.index，认为是PrimarySyntax的commentsAfter
  // - 多个line相同的取先出现的，即index小的
  // - 没有line相同的，取comment.index > PrimarySyntax.index且argmin( PrimarySyntax.index)，
  //    即最接近且在comment之后的PrimarySyntax，认为是PrimarySyntax的commentsBefore
  comments.forEach(commemt => {
    let targetNode: PrimarySyntax | undefined;
    const commentEndIndex = commemt.loc.end.index;
    targetNode = primarySyntaxNodes.find(
      pNode => pNode.loc.end.line === commemt.loc.end.line
    );
    if (targetNode) {
      if (targetNode.loc.start.index > commentEndIndex) {
        targetNode.commentsBefore!.push(commemt);
      } else {
        targetNode.commentsAfter!.push(commemt);
      }
      return;
    }
    let i;
    for (i = 0; i < primarySyntaxNodes.length; i++) {
      const nodeStartIndex = primarySyntaxNodes[i].loc.start.index;
      if (i === 0 && nodeStartIndex > commentEndIndex) {
        targetNode = primarySyntaxNodes[0];
        break;
      }
      // TODO: 处理位于idl末尾的comment
      if (
        nodeStartIndex > commentEndIndex &&
        primarySyntaxNodes[i - 1].loc.start.index < nodeStartIndex
      ) {
        targetNode = primarySyntaxNodes[i];
        break;
      }
    }

    if (targetNode) {
      targetNode.commentsBefore!.push(commemt);
    }
  });
  // 上面用的是浅拷贝直接修改原数据
  return ast;
};

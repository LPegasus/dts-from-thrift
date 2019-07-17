import * as path from 'path';
import { RpcEntity } from '../interfaces';
type IncludeMapType = { [key: string]: RpcEntity };

export const getExternalFileList = (
  includeMap: IncludeMapType,
  rootPath = 'string'
): string[] => {
  let allExternalFiles: string[] = [];
  let externalFiles: string[] = [];
  Object.keys(includeMap).forEach(file => {
    const entity = includeMap[file];
    entity.includes.forEach(include => {
      // 收集所有的文件
      allExternalFiles.push(path.resolve(path.dirname(file), include));
    });
  });
  // 去除在thrift目录下的
  const basePath = rootPath;
  externalFiles = Array.from(new Set(allExternalFiles)).filter(
    file => !file.includes(basePath)
  );
  return externalFiles;
};

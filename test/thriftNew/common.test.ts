import { expect } from 'chai';
import { getExternalFileList } from '../../src/tools/helper';

describe('thrift - print', () => {
  it('find external file from include map', async () => {
    /**
     * 外部文件的生成思路：
     * 1. 根据includeMap统计所有的被include的文件
     * 2. 判断文件是否在-p指出的根目录下
     * 3. 将不在的文件通过readCode处理一遍，并且将其entity中fileName更改为--temp指出的目录下的文件，用于输出
     * 4. 正常输出所有文件
     *
     * 外部文件的测试思路：
     * 1. 判断寻找外部文件是否正常
     * 2. 其余的走的是已有逻辑，利用已有的测试
     */
    const files = getExternalFileList(
      {
        '/usr/thrift/floder1/file1.thrift': {
          enums: [],
          fileName: '',
          includes: ['../../other/base.thrift', './file2.thrift'],
          ns: '',
          services: [],
          interfaces: [],
          typeDefs: []
        },
        '/usr/thrift/floder1/file2.thrift': {
          enums: [],
          fileName: '',
          includes: ['/usr/other/base.thrift', '../../other/base2.thrift'],
          ns: '',
          services: [],
          interfaces: [],
          typeDefs: []
        }
      },
      '/usr/thrift/'
    );
    expect(files.length).to.equal(2);
    expect(files[0]).to.equal('/usr/other/base.thrift');
  });
});

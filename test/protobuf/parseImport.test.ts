import { expect } from 'chai';
import { parseImport } from '../../src/protobuf/parseImport';

describe('protobuf - parse include statement', () => {
  it('can resolve include statement', () => {
    expect(parseImport('import "common.proto";')).to.deep.eq({
      hit: true,
      mc: 'common.proto'
    });
  });
});

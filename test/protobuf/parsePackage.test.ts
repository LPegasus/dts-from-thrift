import { expect } from 'chai';
import { parsePackage } from '../../src/protobuf/parsePackage';

describe('protobuf - parsePackage test', () => {
  it('protobuf.parsePackage pass', () => {
    const line = 'package  "demo";';
    expect(parsePackage(line)).to.be.deep.eq({
      hit: true,
      mc: '"demo"',
    });
  });
});

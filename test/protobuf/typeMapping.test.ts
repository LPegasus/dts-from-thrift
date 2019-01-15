import { expect } from 'chai';
import { typeMapping } from '../../src/protobuf/typeMapping';

describe('protobuf - type mapping', () => {
  it('generic list|map|set should be $type[]', () => {
    expect(typeMapping('map<A.B,C>')).to.be.eq('Map<A.B,C>');
  });

  it('nested generic map test', () => {
    expect(
      typeMapping('list<map<map<life.a, map<life.c>>>>')
    ).to.be.eq('Array<Map<Map<life.a, Map<life.c>>>>');
  });

  it('type with preserve keyword test', () => {
    expect(typeMapping('bytesTest')).to.eq('bytesTest');
    expect(typeMapping('bytes', true)).to.eq('Array<Buffer | number[] | Uint8Array>');
    expect(typeMapping('double', true)).to.eq('number[]');
    expect(typeMapping('double', false)).to.eq('number');
  });
});

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
});

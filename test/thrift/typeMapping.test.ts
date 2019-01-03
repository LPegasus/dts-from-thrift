import { expect } from 'chai';
import { typeMapping } from '../../src/thrift/typeMapping';

describe('thrift - type mapping', () => {
  it('i16 | i32 | byte | double should be number', () => {
    ['i32', 'i16', 'byte', 'double'].forEach(d => {
      expect(typeMapping(d)).to.be.eq('number');
    });
  });

  it('generic list|map|set should be $type[]', () => {
    expect(typeMapping('list<A.B>')).to.be.eq('A.B[]');
    expect(typeMapping('map<A.B,C>')).to.be.eq('Map<A.B,C>');
    expect(typeMapping('set<A.B>')).to.be.eq('Set<A.B>');
  });

  it('nested generic list|map|set test', () => {
    expect(
      typeMapping('list<map<map<life.a, set<life.c>>, list<life.b>>>')
    ).to.be.eq('Array<Map<Map<life.a, Set<life.c>>, life.b[]>>');
  });

  it('i64 should be Int64', () => {
    expect(typeMapping('i64')).to.be.eq('Int64');
  })
});

import { expect } from 'chai';
import { parseInclude } from '../../src/thrift/parseInclude';

describe('thrift - parse include statement', () => {
  it('can resolve include statement', () => {
    expect(parseInclude('include "../base.thrift"'))
      .property('mc', '../base.thrift')
    expect(parseInclude('include "pack_user.thrift"').mc).to.eq(
      'pack_user.thrift'
    );
  });
});

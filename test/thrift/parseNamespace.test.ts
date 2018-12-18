import { expect } from 'chai';
import { parseNamespace } from '../../src/thrift/parseNamespace';

describe('thrift - parseNamespace', () => {
  it('namespace line should hit parser', () => {
    expect(parseNamespace('namespace py life.app').mc).to.eq('life.app');
    expect(parseNamespace('namespace  py  life.app').mc).to.eq('life.app');
    expect(parseNamespace('namespace py \n life.app').mc).to.eq(null);
  });
});

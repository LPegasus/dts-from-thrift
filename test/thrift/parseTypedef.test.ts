import { expect } from 'chai';
import { parseTypedef } from '../../src/thrift/parseTypedef';

describe('thrift - parse typedef statement', () => {
  it('can resolve typedef statement', () => {
    expect(parseTypedef('typedef CollectionBase CollectionResponse')).to.deep.eq({
      alias: 'CollectionResponse',
      type: 'CollectionBase'
    });
  });
});

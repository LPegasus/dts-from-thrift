import { loadPb } from '../../src/protobufNew/index';

it('protobuf new version', async () => {
  await loadPb({ root: '/Users/pegasusknight/git/ex/idl' });
});

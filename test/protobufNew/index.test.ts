import { loadPb } from '../../src/protobufNew/index';

it.only('protobuf new version', async () => {
  const rtn = await loadPb({ root: '/Users/pegasusknight/git/ex/idl' });
  console.log(rtn.size);
});

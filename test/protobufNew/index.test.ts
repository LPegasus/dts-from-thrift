import { expect } from 'chai';
import path from 'path';
import { loadPb } from '../../src/protobufNew/index';

it.skip('protobuf new version', async () => {
  const rtn = await loadPb({ root: '/Users/pegasusknight/git/ex/idl' }, {});
  console.log(rtn.size);
});

it.only('should work with nested enums', async () => {
  const constEnumMap = {};
  const fixturePath = path.resolve(__dirname, '../fixture/nested-enum');
  await loadPb(
    {
      root: fixturePath,
    },
    constEnumMap
  );
  const expected = {
    'nested_enum.Other.OK': 0,
    'nested_enum.Other.ERR': 1,
    'nested_enum.Status.SUCCESS': 0,
    'nested_enum.Status.FAILURE': 1,
  };
  const expectedKeys = Object.keys(expected);
  const actualKeys = Object.keys(constEnumMap);
  expect(actualKeys.length).to.eq(4);

  actualKeys.forEach((k) => {
    expect(expectedKeys).to.include(k);
  });
});

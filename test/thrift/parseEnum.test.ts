import { expect } from 'chai';
import { parseEnum } from '../../src/thrift/parseEnum';

describe('thrift - parse enum', () => {
  it('parse enum block success', () => {
    const blocks = [
      'enum ExampleEnum {',
      '    Error = 1, // comment 1   ',
      '\t\tSuccess = 0# comment 2',
      '}'
    ];
    const iLog = parseEnum(blocks);

    expect(iLog).to.deep.eq({
      name: 'ExampleEnum',
      properties: {
        Error: {
          value: 1,
          comment: 'comment 1'
        },
        Success: {
          value: 0,
          comment: 'comment 2'
        }
      }
    });
  });

  it('parse enum block success with whitespace before', () => {
    const blocks = [
      ' enum ExampleEnum { ',
      '    Error = 1, // comment 1   ',
      '\t\tSuccess = 0# comment 2',
      '}'
    ];
    const iLog = parseEnum(blocks);

    expect(iLog).to.deep.eq({
      name: 'ExampleEnum',
      properties: {
        Error: {
          value: 1,
          comment: 'comment 1'
        },
        Success: {
          value: 0,
          comment: 'comment 2'
        }
      }
    });
  });

  it('parse enum block success without whitespace {', () => {
    const blocks = [
      'enum ExampleEnum{',
      '    Error = 1, // comment 1   ',
      '\t\tSuccess = 0# comment 2',
      '}'
    ];
    const iLog = parseEnum(blocks);

    expect(iLog).to.deep.eq({
      name: 'ExampleEnum',
      properties: {
        Error: {
          value: 1,
          comment: 'comment 1'
        },
        Success: {
          value: 0,
          comment: 'comment 2'
        }
      }
    });
  });
});

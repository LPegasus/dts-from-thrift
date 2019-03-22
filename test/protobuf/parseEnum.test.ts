import { expect } from 'chai';
import { parseEnum } from '../../src/protobuf/parseEnum';

describe('protobuf - parse enum', () => {
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

  it('bufix with single line comment', () => {
    const blocks = `enum H_CMD {
      // 100 ~200 // ai相关命令
      ASK_AI = 1; //问询   -- /:version/aiui/ask
      //1000 - 1099   %100 = 10  作业区间
  }`.split(/\r?\n/);
    const rtn = parseEnum(blocks);
    expect(rtn).to.deep.eq({
      name: 'H_CMD',
      properties: {
        ASK_AI: {
          value: 1,
          comment: '问询   -- /:version/aiui/ask'
        }
      }
    });
  });
});

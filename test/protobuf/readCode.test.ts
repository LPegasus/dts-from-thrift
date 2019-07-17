import { expect } from 'chai';
import * as path from 'path';
import { RpcEntity } from '../../src/interfaces';
import { readCode } from '../../src/protobuf/readCode';

describe('protobuf - readCode test', () => {
  it('protobuf.readCode test pass', async () => {
    const filename = path.resolve(__dirname, './examples/common.proto');
    const entity: RpcEntity = await readCode(filename);

    expect(entity).to.deep.eq({
      fileName: filename,
      services: [],
      enums: [
        {
          name: 'FooEnum',
          properties: {
            Foo: {
              value: 1,
              comment: ''
            },
            Bar: {
              value: 2,
              comment: 'comment of bar'
            }
          }
        }
      ],
      includes: ['base.proto'],
      ns: 'anote_op',
      interfaces: [
        {
          name: 'StatusInfo',
          properties: {
            status_msg: {
              index: 1,
              type: 'string',
              comment: '',
              defaultValue: '',
              optional: false
            },
            now: {
              index: 2,
              type: 'Int64',
              comment: '',
              defaultValue: '',
              optional: false
            },
            log_id: {
              index: 3,
              type: 'string',
              comment: '',
              optional: false,
              defaultValue: ''
            }
          },
          childrenEnums: [],
          childrenInterfaces: []
        },
        {
          childrenEnums: [],
          childrenInterfaces: [],
          name: 'GeneralResponse',
          properties: {
            status_code: {
              type: 'number',
              index: 1,
              comment: '',
              defaultValue: '',
              optional: false
            },
            status_info: {
              type: 'StatusInfo[]',
              optional: false,
              defaultValue: '',
              comment: '',
              index: 2
            }
          }
        }
      ],
      typeDefs: []
    } as RpcEntity);
  });
});

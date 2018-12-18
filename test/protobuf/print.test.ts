import { expect } from 'chai';
import * as path from 'path';
import { readCode } from '../../src/protobuf/readCode';
import {
  printInterfaces,
  getInternalInterfacesAndEnums
} from '../../src/protobuf/print';

describe('protobuf - print test', () => {
  it('protobuf.print pass', async () => {
    const entity = await readCode(
      path.resolve(__dirname, 'examples/nested.proto')
    );
    const res = printInterfaces(entity);
    expect(typeof res).to.be.eq('string');
  });

  it('protobuf.print getInternalInterfacesAndEnums pass', async () => {
    const entity = await readCode(
      path.resolve(__dirname, 'examples/nested.proto')
    );
    const [enums, interfaces] = getInternalInterfacesAndEnums(
      entity.interfaces[0]
    );
    expect(interfaces).to.deep.eq([
      {
        childrenEnums: [],
        childrenInterfaces: [],
        name: 'Foo',
        properties: {
          baz: {
            type: 'string',
            index: 1,
            comment: '',
            defaultValue: '',
            optional: false
          }
        }
      },
      {
        childrenEnums: [],
        childrenInterfaces: [],
        name: 'Poo',
        properties: {
          Lol: {
            type: 'number',
            index: 1,
            comment: 'LOL',
            defaultValue: '',
            optional: false
          }
        }
      }
    ]);

    expect(enums).to.deep.eq([
      {
        name: 'LinkType',
        properties: {
          A: {
            value: 1,
            comment: ''
          },
          B: {
            value: 2,
            comment: ''
          }
        }
      }
    ]);
  });
});

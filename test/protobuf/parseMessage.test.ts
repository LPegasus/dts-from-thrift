import { expect } from 'chai';
import { parseMessage } from '../../src/protobuf/parseMessage';
import { InterfaceEntity } from '../../src/interfaces';

describe('protobuf - parseMessage', () => {
  it('protobuf.parseMessage test with fomatted code pass', () => {
    const simpleSource = [
      'message UrlInfo {',
      '    string uri = 1;',
      '    repeated string urls = 2;',
      '}'
    ];
    const simpleSourceEntity = parseMessage(simpleSource);
    expect(simpleSourceEntity).to.be.deep.eq({
      name: 'UrlInfo',
      properties: {
        uri: {
          type: 'string',
          index: 1,
          comment: '',
          defaultValue: '',
          optional: false
        },
        urls: {
          type: 'string[]',
          index: 2,
          comment: '',
          defaultValue: '',
          optional: false
        }
      },
      childrenEnums: [],
      childrenInterfaces: []
    } as InterfaceEntity);
  });

  it('protobuf.parseMessage test with whitespace and comments code', () => {
    const simpleSourceWithWhiteSpace = [
      'message UrlInfo{',
      '  string  uri   =  1; /// uri_comment',
      '     repeated    string  urls =     2;   //urls_comment',
      '}'
    ];
    const simpleSourceEntity = parseMessage(simpleSourceWithWhiteSpace);
    expect(simpleSourceEntity).to.be.deep.eq({
      name: 'UrlInfo',
      properties: {
        uri: {
          type: 'string',
          index: 1,
          comment: '/ uri_comment',
          defaultValue: '',
          optional: false
        },
        urls: {
          type: 'string[]',
          index: 2,
          comment: 'urls_comment',
          defaultValue: '',
          optional: false
        }
      },
      childrenEnums: [],
      childrenInterfaces: []
    } as InterfaceEntity);
  });

  it('protobuf.parseMessage test with defaultValue', () => {
    const simpleSourceWithWhiteSpace = [
      'message UrlInfo{',
      '  number  uri   =  1 [default = 3]; /// uri_comment',
      '     string    urls =     2[default= "12"];   //urls_comment',
      '}'
    ];
    const simpleSourceEntity = parseMessage(simpleSourceWithWhiteSpace);
    expect(simpleSourceEntity).to.be.deep.eq({
      name: 'UrlInfo',
      properties: {
        uri: {
          type: 'number',
          index: 1,
          comment: '/ uri_comment',
          defaultValue: '3',
          optional: false
        },
        urls: {
          type: 'string',
          index: 2,
          comment: 'urls_comment',
          defaultValue: '"12"',
          optional: false
        }
      },
      childrenEnums: [],
      childrenInterfaces: []
    } as InterfaceEntity);
  });

  it('protobuf.parseMessage test with nested message', () => {
    const nestedSourceCode = [
      'message UrlInfo{',
      '  string  uri   =  1; /// uri_comment',
      '  repeated    string  urls =     2;   //urls_comment',
      '  message UrlExtInfo{',
      '    optional number infoType = 1 [default = 1];',
      '    message Content {',
      '      string key = 1;',
      '      string value = 2; // content.value.comment',
      '    }',
      '    optional Content content = 2;',
      '  }',
      'enum EnumType {',
      'F = 1',
      'M = 2',
      '}',
      '  repeated UrlExtInfo extInfo = 4;',
      ' EnumType gender = 5 [default = F];',
      '}'
    ];
    const entity = parseMessage(nestedSourceCode, {});
    expect(entity).to.be.deep.eq({
      name: 'UrlInfo',
      properties: {
        uri: {
          type: 'string',
          index: 1,
          comment: '/ uri_comment',
          defaultValue: '',
          optional: false
        },
        urls: {
          type: 'string[]',
          index: 2,
          comment: 'urls_comment',
          defaultValue: '',
          optional: false
        },
        extInfo: {
          type: 'UrlExtInfo[]',
          index: 4,
          comment: '',
          defaultValue: '',
          optional: false
        },
        gender: {
          type: 'EnumType',
          defaultValue: 'EnumType.F',
          index: 5,
          comment: '',
          optional: false
        }
      },
      childrenEnums: [
        {
          name: 'EnumType',
          properties: {
            F: {
              comment: '',
              value: 1
            },
            M: {
              comment: '',
              value: 2
            }
          }
        }
      ],
      childrenInterfaces: [
        {
          name: 'UrlExtInfo',
          properties: {
            infoType: {
              type: 'number',
              index: 1,
              comment: '',
              defaultValue: '1',
              optional: false // for has defaultValue, it will always be false
            },
            content: {
              type: 'Content',
              optional: true,
              comment: '',
              defaultValue: '',
              index: 2
            }
          },
          childrenEnums: [],
          childrenInterfaces: [
            {
              name: 'Content',
              properties: {
                key: {
                  type: 'string',
                  index: 1,
                  comment: '',
                  defaultValue: '',
                  optional: false
                },
                value: {
                  type: 'string',
                  index: 2,
                  comment: 'content.value.comment',
                  defaultValue: '',
                  optional: false
                }
              },
              childrenInterfaces: [],
              childrenEnums: []
            }
          ]
        }
      ]
    } as InterfaceEntity);
  });

  it('protobuff - bugcase #1', () => {
    const source = `message VideoContent {
      map<string, int32> region_usage_stat = 7;
  }`;
    const res = parseMessage(source.split(/\n/g));
    expect(res).to.be.deep.eq({
      name: 'VideoContent',
      properties: {
        region_usage_stat: {
          type: 'Map<string, number>',
          index: 7,
          optional: false,
          comment: '',
          defaultValue: ''
        }
      },
      childrenEnums: [],
      childrenInterfaces: []
    });
  });
});

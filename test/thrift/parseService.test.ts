import { expect } from 'chai';
import {
  parseServiceInterface,
  parseService,
  formatServiceFirstLine,
  isServiceBlockStart
} from '../../src/thrift/parseService';
import { ServiceEntity, RpcEntity } from '../../src/interfaces';

describe('thrift - parseService test', () => {
  it('parseServiceInterface pass', () => {
    const interfaceAssets: ServiceEntity['interfaces'] = {};
    parseServiceInterface(
      interfaceAssets,
      'RangeResponse    RangeItem            (1: RangeRequest req)  #总是按时间倒序'
    );
    expect(interfaceAssets).haveOwnProperty('RangeItem');
    expect(interfaceAssets)
      .ownProperty('RangeItem')
      .to.be.deep.eq({
        returnType: 'RangeResponse',
        comment: '总是按时间倒序',
        inputParams: [{ type: 'RangeRequest', name: 'req', index: 1 }]
      });
  });

  it('isServiceBlockStart pass', () => {
    expect(isServiceBlockStart('  service   _KJFEO_ {}')).to.deep.eq({
      hit: true,
      mc: '_KJFEO_'
    });
    expect(isServiceBlockStart('  service   _KJFEO_{//')).to.deep.eq({
      hit: true,
      mc: '_KJFEO_'
    });
    expect(isServiceBlockStart('service D { //')).to.deep.eq({
      hit: true,
      mc: 'D'
    });
    expect(isServiceBlockStart('//service D { //')).to.deep.eq({
      hit: false,
      mc: null
    });
    expect(isServiceBlockStart('/*service D { //')).to.deep.eq({
      hit: false,
      mc: null
    });
  });

  it('parseService pass', () => {
    const codes = [
      'service ItemProviderService {',
      '  RangeResponse    RangeItem            (1: RangeRequest req);  #总是按时间倒序',
      '  // 根据时间来请求item信息',
      '  ItemListResponse ItemListByCreateTime (1: RangeRequest req),  ',
      '  // 根据ID来请求详情',
      '  ItemListResponse ItemListByID         (1: ItemIDListRequest req)  #按照ID',
      '  ItemClearAllResponse ItemListClear  ()  // NO INPUT',
      '}'
    ];
    expect(parseService(codes)).to.be.deep.eq({
      name: 'ItemProviderService',
      interfaces: {
        RangeItem: {
          returnType: 'RangeResponse',
          inputParams: [{ type: 'RangeRequest', name: 'req', index: 1 }],
          comment: '总是按时间倒序'
        },
        ItemListByCreateTime: {
          returnType: 'ItemListResponse',
          inputParams: [{ type: 'RangeRequest', name: 'req', index: 1 }],
          comment: ''
        },
        ItemListByID: {
          returnType: 'ItemListResponse',
          inputParams: [{ type: 'ItemIDListRequest', name: 'req', index: 1 }],
          comment: '按照ID'
        },
        ItemListClear: {
          returnType: 'ItemClearAllResponse',
          inputParams: [],
          comment: 'NO INPUT'
        }
      }
    });
  });

  it('parseService bugfix #1', () => {
    const codes = [
      'service LocationService {PigEntityResponse CreatePig(1: PigResult request)',
      '// xxxxxxxx',
      'EmptyStatusResponse Status( )',
      '  }'
    ];
    expect(parseService(codes)).to.be.deep.eq({
      name: 'LocationService',
      interfaces: {
        CreatePig: {
          returnType: 'PigEntityResponse',
          inputParams: [{ name: 'request', type: 'PigResult', index: 1 }],
          comment: ''
        },
        Status: {
          returnType: 'EmptyStatusResponse',
          inputParams: [],
          comment: ''
        }
      }
    } as ServiceEntity);
  });

  it('formatServiceFirstLine OK', () => {
    const codes = [
      'service LocationService {PigEntityResponse CreatePig(1: PigResult request) //xxxxx',
      'EmptyStatusResponse Status( )',
      '  }'
    ];
    formatServiceFirstLine(codes);
    expect(codes).to.deep.eq([
      'service LocationService {',
      'PigEntityResponse CreatePig(1: PigResult request) //xxxxx',
      'EmptyStatusResponse Status( )',
      '  }'
    ]);
  });

  it('parseService bugfix #2', () => {
    const codes = [
      'service LocationService {PigEntityResponse CreatePig(1: PigResult request)} //xxxxx'
    ];
    const entity = parseService(codes);
    expect(entity).to.deep.eq({
      name: 'LocationService',
      interfaces: {
        CreatePig: {
          returnType: 'PigEntityResponse',
          inputParams: [{ type: 'PigResult', name: 'request', index: 1 }],
          comment: 'xxxxx'
        }
      }
    });
  });

  it('parseServiceInterface feat: multi params', () => {
    const interfaces: ServiceEntity['interfaces'] = {};
    parseServiceInterface(
      interfaces,
      'StringList available_api(1:string src_lang, 2:string trg_lang),       // no need to use, for test'
    );

    expect(interfaces.available_api).to.deep.eq({
      comment: 'no need to use, for test',
      returnType: 'StringList',
      inputParams: [
        {
          type: 'string',
          name: 'src_lang',
          index: 1
        },
        {
          type: 'string',
          name: 'trg_lang',
          index: 2
        }
      ]
    } as ServiceEntity['interfaces']['d']);
  });
});

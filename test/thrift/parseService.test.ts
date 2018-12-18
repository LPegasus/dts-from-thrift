import { expect } from 'chai';
import {
  parseServiceInterface,
  parseService,
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
        inputType: 'RangeRequest'
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
          inputType: 'RangeRequest',
          comment: '总是按时间倒序'
        },
        ItemListByCreateTime: {
          returnType: 'ItemListResponse',
          inputType: 'RangeRequest',
          comment: ''
        },
        ItemListByID: {
          returnType: 'ItemListResponse',
          inputType: 'ItemIDListRequest',
          comment: '按照ID'
        },
        ItemListClear: {
          returnType: 'ItemClearAllResponse',
          inputType: '',
          comment: 'NO INPUT'
        }
      }
    });
  });

  it('parseService bugfix #1', () => {
    const codes = [
      'service LocationService {',
      '// xxxxxxxx',
      'PigEntityResponse CreatePig(1: PigResult request)',
      'EmptyStatusResponse Status( )',
      '  }'
    ];
    expect(parseService(codes)).to.be.deep.eq({
      name: 'LocationService',
      interfaces: {
        CreatePig: {
          returnType: 'PigEntityResponse',
          inputType: 'PigResult',
          comment: ''
        },
        Status: {
          returnType: 'EmptyStatusResponse',
          inputType: '',
          comment: ''
        }
      }
    } as ServiceEntity);
  });
});

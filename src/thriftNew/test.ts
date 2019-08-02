import { parse } from './@creditkarma/thrift-parser';
import * as fs from 'fs-extra';

const file =
  '/Users/liuqi/Sites/dts-from-thrift/fix/service_rpc_idl/content/online_cloud/relation_list.thrift';
const content = fs.readFileSync(file);

console.log(parse(content.toString()));

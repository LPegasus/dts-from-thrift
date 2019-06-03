const pb = require('protobufjs');
const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const rootDir = '/Users/pegasusknight/git/ex/idl';
// const filename = '/Users/pegasusknight/git/ex/idl/crm/oa_api/oa_common.proto';
const filename = '/Users/pegasusknight/git/ex/idl/api/ex_logic.proto';
// const filename = rootDir + '/enum_type.proto';
const code = fs.readFileSync(filename, 'utf8');
const dirname = path.parse(filename).dir;

const protofiles = glob.sync('!(crm)/*.proto', { cwd: rootDir }).map(d => path.join(rootDir, d));

const ast = pb.parse(code, { keepCase: true, alternateCommentMode: true });
const ns = ast.package;

const rtn = ast.root.lookup(ns);
console.log(rtn);

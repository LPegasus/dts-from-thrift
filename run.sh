rm -rf ./test/thriftNew/out/ && yarn build && \
# dts-from-thrift -V
node ./bin/dts-from-thrift -p ./test/thriftNew/examples/ \
-o ./test/thriftNew/out/ \
 -e reference.d.ts --use-tag=go --enum-json  --strict-request --rpc-namespace=anote.rpc --new \
 --map Record --i64 string

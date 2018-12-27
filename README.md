# dts-from-thrift

[![npm version](https://badge.fury.io/js/dts-from-thrift.svg)](https://www.npmjs.com/package/dts-from-thrift)[![build](https://travis-ci.org/LPegasus/dts-from-thrift.svg?branch=master)](https://travis-ci.org/LPegasus/dts-from-thrift)[![coverage](https://img.shields.io/codecov/c/github/LPegasus/dts-from-thrift.svg?style=flat-square)](https://codecov.io/gh/LPegasus/dts-from-thrift)[![install size](https://packagephobia.now.sh/badge?p=dts-from-thrift)](https://packagephobia.now.sh/result?p=dts-from-thrift)

thrift RPC 定义文件转 d.ts 工具

__安装(install)：__ `npm install dts-from-thrift -g`

__运行(exec)：__`dts-from-thrift -p ~/git/my-thrift-repo/thrift -o ~/git/my-ts-repo/typings`

由于实现全靠正则，特殊 case 无法避免，可以提 issue 或者 PR。

(The tool use RegExp to generate d.ts file. If some special statement cases causes bugs, an issue or a PR is welcome.)



# 变更历史（ChangeLog)

## 0.8.6 - 2018.12.27

### bugfix

- 正确解析单行 service 声明

  parse single line service declaration currectly.

- typeof 泛型映射修复

  typedef generic type fix


## 0.8 - 2018.11.26

### Added

- 为 `${namespace}._Summary_` 接口增加了 `WrapperService` 推导函数。用来解决 `i64` 转 number 在 js 下需要特殊处理的问题。可以通过扩展 `Int64Type` 接口来实现自己的 `i64` 类型适配

  Add a type inference wrapper function to process the i64 type. Extends the `Int64Type` interface for customization.

## 0.7 - 2018.11.20

### Added

- `dts-from-thrift` 支持合并 service 到一个定义文件中

  使用 `--rpc-namespace=xxx` 来指定需要合并到的 namespace 中，并且可以通过 `${namespace}._Summary_` 来获得一个总的 interface 用以继承

  ```javascript
  > dts-from-thrift -p ./ -o ../typings --rpc-namespace=demo.rpc
  	// 你输入的命令 (the Command you input)
  > RPC d.ts files is /Users/xxx/projectpath/typings/demo.rpc-rpc.d.ts
  	// 生成的 rpc 定义文件 (the rpc definition file name)
  ```

  使用 \_Summary_ 继承 rpc 接口 (use \_Summary_ to extends)

  ```typescript
  interface MyRPCContainer extends demo.rpc._Summary_ {}
  ```

### Fix

- 修复 service 无形参接口的报错问题

  fix service interfaces which are without input params

## 0.6 - 2018.11.13

### Added

- thrift 现在支持生成 `service RpcService {}` 定义

  (support service definition)

  ```typescript
  // thrift sample
  service RpcService {
      ResponseType interface1 (1: RequestType req);
  }
  
  // generate code
  export interface RpcService {
      interface1(req: RequestType): Promise<ResponseType>;
  }
  ```



## 0.5

### Added

  - dts-from-protobuf 支持

     (add dts-from-protobuf CLI, support protobuf)

     `dts-from-protobuf -p <protobuf_idl_dir> -o <output_dir>`

## 0.4

### Added

- --use-tag CLI option，来支持下面的语法

  (add a new option [--use-tag] to replace original fieldname with tagname)

  ```csharp
  struct Foo {
    1: list<string> comments (go.tag="json:\\"list,omitempty\\""),
  }
  
  // before 0.4.0
  interface Foo {
    comments: string[];
  }
  
  // after 0.4.0 with [--use-tag go]
  interface Foo {
    list: string[];
  }
  // detail in parseStruct.test.ts
  ```

### Changed

- codestyle: 生成文件增加 `// prettier-ignore` 避免 format 导致的 git 提交

   (add `// prettier-ignore` at head of d.ts file to prevent useless git commit)
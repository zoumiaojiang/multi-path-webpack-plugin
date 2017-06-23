# multi-path-webpack-plugin

解决 webpack 项目需要多级 path 部署时的全局静态资源绝对路径替换的问题

## Usage

### 安装

```bash
npm install --save-dev multi-path-webpack-plugin
```

### 注册 pligin

```
// ...
var MulitPathWebpackPlugin = require('multi-path-webpack-plugin');
// ...

webpack({
    // ...
    plugins: [
        // ...
        // 放在插件数组的组后面
        new MultiPathWebpackPlugin({/* options */})
    ]

    // ...
})
```

## options 参数

### prefix

通常，如果我们的 html 是由 [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin) 生成的话，我们必须将配置配成 `webpack-html-plugin` 的 prefix，即 `assetPublicPath`

```js
{
    prefix: config.build.assetPublicPath
}
```
其他场景可以自定义指定 `prefix`


###  ignore

ignore 参数可以指定你不想替换静态资源的 path 的规则，规则同 [minimatch](https://github.com/isaacs/minimatch)

```
{
    ignore: [
        '*.map',
        '**/*.map'
    ]
}
```


## note 注意事项

插件采取的是全局正则替换方案，能够找到 `"/a/b/c"`, `'/a/b/c'`, `(/a/b/c)`, `=/a/b/c` 类型的绝对路径 path， 当不需要替换的绝对路径，请避免这些写法。

下列实例请在开发中操作绝对路径时参考：

``` js
// 如果 prefix 为 /prefix/

var path = '/a/b/c.js';
// 转成 /prefix/a/b/c.js

var path1 = "/a/b/c.js";
// 转成 /prefix/a/b/c.js


<link href=/a/b/c ...>
// 转成 <link href=/prefix/a/b/c>

background: url(/a/b/c.png);
// 转成 background: url(/prefix/a/b/c.png);

```



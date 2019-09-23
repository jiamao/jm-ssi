# jm-ssi

[![NPM version][npm-image]][npm-url]
[![npm download][download-image]][download-url]

`nodejs` 解析`ssi`库。

支持以下语法：
```html
 <!--# include file="path" -->
<!--# include virtual="path" -->

<!--# set var="k" value="v" -->

<!--# echo var="name" default="default" -->

<!--# if expr="$name = /text/" -->
<!--# if expr="$name != text" -->
<!--# else -->
<!--# endif -->
```

## Install

```bash
$ npm i jm-ssi --save
```

## Usage

```js
const ssi = require('jm-ssi');

ssi.run(`<!--#if expr="\${HTTP_HOST} = /www.tenganxinxi.com/"-->
<title>腾讯腾安</title>
<!--#elif expr="\${HTTP_HOST} = /www.txfund.com/-->
<title>腾讯腾安2</title>
<!--#else-->
<title>腾讯理财通</title>
<!--#endif-->`, {
    // 指定执行变量
    data: {
        "HTTP_HOST": "www.txfund.com"
    }
}).then((result) => {
    console.log(result);
});

```

#### 文件模板解析
`index.shtml`
```html
<!--#if expr="${HTTP_HOST} = www.tenganxinxi.com"-->
<title>腾讯腾安</title>
<!--#else-->
<title>腾讯理财通</title>
<!--#endif-->

<div>test $ ````</div>

<!--#echo var="HTTP_USER_AGENT" -->

<!--# include virtual="/if.shtml" stub="one" -->
```

```js
const path = require('path');
const ssi = require('jm-ssi');

const root = path.join(__dirname, 'templates');
ssi.parse('index.shtml', {
    // 指定执行变量
    data: {
        "name": 'fefeding',
        "HTTP_HOST": "www.txfund.com",
        "HTTP_USER_AGENT": "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 wechatdevtools/1.02.1907300 MicroMessenger/6.7.3 Language/zh_CN webview/1568882530032134 webdebugger port/31804",
    },
    root
}).then(result => {
    console.log(result);
});
```


## License

[MIT](LICENSE)

[npm-image]: https://img.shields.io/npm/v/jm-ssi.svg?style=flat-square
[npm-url]: https://npmjs.org/package/jm-ssi
[download-image]: https://img.shields.io/npm/dm/jm-ssi.svg?style=flat-square
[download-url]: https://npmjs.org/package/jm-ssi

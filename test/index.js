const path = require('path');
const ssi = require('../index');

/*
ssi.run(`<!--#if expr="\${HTTP_HOST} = /www.tenganxinxi.com/"-->
<title>腾讯腾安</title>
<!--#elif expr="\${HTTP_HOST} = /www.txfund.com/-->
<title>腾讯腾安2</title>
<!--#else-->
<title>腾讯理财通</title>
<!--#endif-->`, {
    data: {
        "HTTP_HOST": "www.txfund.com"
    }
}).then((result) => {
    console.log(result);
    console.log('\n\n\n');
});*/


/*

ssi.decode(`<!--#set var = "IS_V5_GRAY" value = "112" -->
<div>test $ </div>`).then((code) => {
    console.log(code);
    console.log('\n\n\n');
});



ssi.decode(`<!--#echo var="IS_V5_GRAY" default="0" -->`).then((code) => {
    console.log(code);
    console.log('\n\n\n');
});



ssi.decode(`<!--#if expr="123"-->
<!--#set var = "IS_V5_GRAY" value = "true" -->
<!--#endif-->`).then((code) => {
    console.log(code);
    console.log('\n\n\n');
});



ssi.decode(`<!--#if expr="\${name}"-->
<!--#set var = "IS_V5_GRAY" value = "false" -->
<!--#endif-->`).then((code) => {
    console.log(code);
    console.log('\n\n\n');
});
*/

const root = path.join(__dirname, 'templates');
ssi.parse('index.shtml', {
    data: {
        "name": 'fefeding',
        "HTTP_HOST": "www.txfund.com",
        "HTTP_USER_AGENT": "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1 wechatdevtools/1.02.1907300 MicroMessenger/6.7.3 Language/zh_CN webview/1568882530032134 webdebugger port/31804",
    },
    root
}).then(result => {
    console.log(result);
});
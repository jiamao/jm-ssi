
const path = require('path');
const fs = require('fs');

const codeArrName = '__p__';
const syntaxReg = /<!--#\s*([^\r\n]+?)\s*-->/mg;
const includeFileReg = /^\s*include\s+(file|virtual)=(['"])([^\r\n]+?)(['"])\s*(.*)/;
const setVarReg = /^\s*set\s+var\s*=\s*['"]?([^'"]+)['"]?\s+value\s*=\s*([\w\W]*)?\s*$/;
const echoReg = /\s*echo\s+var\s*=\s*['"]?([^'"]+)['"]?(\s+default\s*=\s*(['"][\w\W]*['"])\s*)?\s*/;
const ifReg = /^\s*if\s+expr\s*=\s*['"]?([^'"]*)?['"]?\s*$/;
const elifReg = /^\s*elif\s+expr\s*=\s*['"]?([^'"]*)?['"]?\s*$/;
const elseReg = /^\s*else\s*$/;
const endifReg = /^\s*endif\s*$/;

// 分割代码块
// ssi表达式和普通文本分离
function resolveTemplate(tpl) {
    if(typeof tpl != 'string') {
        return tpl;
    }
    
    const tags = [];
    let index = 0;
    tpl.replace(syntaxReg, (m, r, i, src) => {
        if(i > index) {
            tags.push({
                content: src.substring(index, i).replace(/\$/g, '\\$').replace(/`/g, '\\`') // $符号需要处理，跟``取变量冲突
            });
        }
        // 运行表达式
        tags.push({
            match: m,
            expression: r,
            index: i
        });
        index = i + m.length;// 向前移到当前表达式结尾
    });
    
    // 如果最后还有未处理的，则也加进到模板里
    if(index < tpl.length - 1) {
        tags.push({
            content: tpl.substr(index)
        });
    }
    return tags;
}

// 把模板解析成可执行的js代码
// options {}   file 当前文件路径， root 当前根路径
async function decode(tpl, options) {
    options = options || {};
    return new Promise(async (resolve, reject) => {
        try {
            const syntaxs = resolveTemplate(tpl);
            if(!syntaxs || !syntaxs.length) return "";
            const code = []; // 代码块
            for(let l of syntaxs) {
                if(!l) continue;
                if(l.content) {
                    code.push(`${codeArrName}.push(\`${l.content}\`);`);
                }
                if(l.expression) {
                    code.push(await resolveSyntax(l.expression, options));
                }
            }
            resolve && resolve(`if(typeof ${codeArrName}=='undefined'){var ${codeArrName}=[];}` + code.join('\n') + ` return ${codeArrName}.join('');`);
        }
        catch(e) {
            console.error(e);
            reject && reject(e);
        }
    });    
}

// 处理ssi关健表达式
async function resolveSyntax(expression, options) {
    return new Promise(async (resolve, reject) => {
        // 对表达式转换成js对应的
        let m = null;
        let result = '';
        switch(true) {
            // set var表达式
            case !!(m = expression.match(setVarReg)): {
                result = convertSetVar(m);
                break;
            }
            // echo表达式
            case !!(m = expression.match(echoReg)): {
                result = convertEcho(m);
                break;
            }
            // if 表达式
            case !!(m = expression.match(ifReg)): {
                result = convertIF(m);
                break;
            }
            // elif 表达式
            case !!(m = expression.match(elifReg)): {
                result = convertELIF(m);
                break;
            }
            // else 表达式
            case !!(m = expression.match(elseReg)): {
                result = convertELSE(m);
                break;
            }
            // endif 表达式
            case !!(m = expression.match(endifReg)): {
                result = convertENDIF(m);
                break;
            }
            // include 文件模板
            case !!(m = expression.match(includeFileReg)): {
                result = await resolveInclude(m, options);
                break;
            }
        }
        resolve && resolve(result);
    });
}


// 处理include
function resolveInclude(m, options) {
    return new Promise(async (resolve, reject) => {
        let result = '';
        if(m && m.length > 3 && m[3]) {
            let file = m[3];
            let parent = options.root || '';
            // 用了相对路径，则相对于父路径
            if(file.indexOf('.') === 0) {
                if(options.file) parent = path.dirname(options.file);
            }
            //console.log(parent,file);
            file = path.join(parent, file);
            //console.log(file);
            if(fs.existsSync(file)) {
                fs.readFile(file, 'utf8', async (err, data) => {
                    if(err) {
                        reject && reject(err);
                    }
                    else {
                        let opt = Object.assign({}, options, {file: file});
                        let ret = await decode(data, opt);
                        resolve && resolve(ret);
                    }
                });
                return;
            }
        }
        resolve && resolve(result);
    });
}

// 声明变量转换
function convertSetVar(m) {
    if(m && m.length > 2) {
        return `var ${m[1]}=${m[2]};`;
    }
    return '';
}

// echo转换
function convertEcho(m) {
    if(m && m.length > 1) {
        let c = `if(typeof ${m[1]} == 'undefined'){console.error('${m[1]} is not defined');`;
        // 如果有default值
        if(m.length > 3 && m[3]) {
            c += `${codeArrName}.push(${m[3]});`;
        }
        return c + ` } else {${codeArrName}.push(${m[1]});}`;
    }
    return '';
}

// if 表达式
function convertIF(m) {
    if(m.length > 1) {
        let exp = convertExpr(m[1]);
        return `if(${exp}){`;
    }
    return 'if(true){';
}

// if 表达式
function convertELIF(m) {
    if(m.length > 1) {
        let exp = convertExpr(m[1]);
        return `} else if(${exp}){`;
    }
    return '} else if(true){';
}
// if 表达式
function convertELSE(m) {
    return '} else {';
}
// if 表达式
function convertENDIF(m) {
    return '}';
}

// 把expr表达式转为js代码
// a=b ，这里的a,b可以是常量，也可能是取的变量，b可能是一个正则
/*expr - 判定一个表达式，可以是变量：
  <!--# if expr="$name" -->
比较字符串：
  <!--# if expr="${name} = text" -->
  <!--# if expr="$name != text" -->
或者匹配正则：
  <!--# if expr="$name = /text/" -->
  <!--# if expr="$name != /text/" -->*/
function convertExpr(expr) {
    // 没有=号表示为单变量方式，直接返回它即可
    if(expr.indexOf('=') === -1) {
        return convertVar(expr);
    }
    // 判断表达式
    else if(/([^"']+)\s*([!]?=)\s*([^"']+)/.test(expr)) {
        let varname = RegExp.$1;
        let expequal = RegExp.$2 == '='? '==' : RegExp.$2; // = or !=   =转为==
        let varvalue = RegExp.$3.trim();// 表达式值， 如果有//前后，则为正则表达式 否则为变量或常量

        varname = convertVar(varname);

        // 正则
        if(/^\/[^'"]+\/$/.test(varvalue)) {
            return `${expequal=='!='?'!':''}${varvalue}.test(${varname})`;
        }
        else {
            // 如果是变量，则转为js变量
            if(/^\$/.test(varvalue)) {
                varvalue = convertVar(varvalue);
            }
            // 加上引号
            else {
                varvalue = `"${varvalue}"`;
            }
            return `${varname}${expequal}${varvalue}`;
        }
    }
    return '';
}

// 变量可以是 $name 或 ${name} ，为了适应js，我们把它转成 name
function convertVar(v) {
    v = v.trim();
    if(v && /\$([^{}\s]+)/.test(v)) {
        v = RegExp.$1;
    }    
    else if(v && /\${([^}]+)}/.test(v)) {
        // 转为常量
        v = RegExp.$1;
    }
    return v;
}

module.exports = {
    decode
}
const vm = require("vm");
const ssidecode = require('./decode');


/**
 * // 运行模板，
 * tpl {string} 模板
 * options {object} 参数
 *      data 运行时参数
 *      root ssi执行根路径
 */
module.exports = function(tpl, options) {
    options = options || {};
    options.data = options.data || {};
    options.root = options.root || '';

    return new Promise((resolve, reject) => {
        ssidecode.decode(tpl, options).then(code => {
            const result = runCode(code, options.data);
            resolve && resolve(result);
        }).catch(err => {
            reject && reject(err);
        });
    });
}

// 执行模板
function runCode(code, vars) {
    const params = [];
    /*const parvalues = [];
    if(vars) {           
        for(var k in vars) {
            if(!vars.hasOwnProperty(k)) continue;
            parvalues.push(vars[k]);
            params.push(k);
        }
    }*/
   // console.log(code);
    const context = vm.createContext(vars);
    const fun = vm.compileFunction(code, params, {
        //filename: p
        parsingContext: context
    });

    
    //return script.runInContext(context);
    return fun.call(context);
}
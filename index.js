const fs = require('fs');
const path = require('path');
const decode = require('./lib/decode');
const run = require('./lib/run');

// 解析ssi文件,
/**
 * // 运行模板，
 * file {string} 文件路径
 * options {object} 参数
 *      data 运行时参数
 *      root ssi执行根路径
 */ 
async function parse(file, options) {
    options = Object.assign({}, options);
    return new Promise(async (resolve, reject) => {
        if(options.root) file = path.resolve(options.root || '', file);
        options.file = file;
        
        fs.readFile(file, 'utf8', async (err, data) => {
            if(err) {
                reject && reject(err);
            }
            else {
                let result = await run(data, options);
                resolve && resolve(result);
            }
        });
        
    });
}

module.exports = {
    decode: decode.decode,
    run,
    parse
};
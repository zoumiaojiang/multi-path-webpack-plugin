/**
 * @file 解决项目部署位置为非域名根目录问题
 * @author mj(zoumiaojiang@gmail.com)
 */

/* eslint-disable */

import minimatch from 'minimatch';
import path from 'path';

/**
 * MultiPath 插件
 *
 * @constructor
 * @param {Object} options 参数
 */
function MultiPathPlugin(options = {}) {
    this.prefix = options.prefix || '/';
    this.ignore = [
        '*.vue',
        '**/*.vue',
        '*.jsx',
        '**/*.jsx',
        '*.react',
        '**/*.react',
        '*.map',
        '**/*.map'
    ].concat(options.ignore || []);
}

/**
 * 数组去重
 *
 * @param  {Array} arr 数组
 * @return {Array}     去重后的数组
 */
function uniqArr(arr) {
    const obj = {};
    arr.forEach(item => obj[item] = true);
    return Object.keys(obj);
}

/**
 * 忽略指定的 path
 *
 * @param  {Array} ignores   忽略规则列表
 * @param  {string} pathName 需要判断的 path
 * @return {boolean}          判断的结果
 */
function ignoreMatch(ignores, pathName) {
    let result = false;
    ignores.forEach(ignore => {
        if (minimatch(pathName, ignore)) {
            result = true;
        }
    });

    return result;
}


/**
 * 插件入口
 *
 * @param  {Object} compiler 编译器对象
 */
MultiPathPlugin.prototype.apply = function (compiler) {

    let prefix = this.prefix || '/';
    let ignores = this.ignore;

    ignores.push(prefix);
    ignores.push(path.resolve(prefix, './**'));
    ignores = uniqArr(ignores);

    compiler.plugin('emit', (compilation, callback) => {

        Object.keys(compilation.assets).forEach(key => {

            let asset = compilation.assets[key];
            let content = asset.source();

            if (typeof content === 'string' && !/((vendor)|(\.map$))/.test(key)) {

                let replacePrefix = item => {
                    if (item[0] === '+') {
                        return item;
                    }
                    return item.replace(/\/[^'"?]*/g, p => {
                        if (ignoreMatch(ignores, p)) {
                            return p;
                        }
                        console.log(key, p);
                        return p.replace(/\//, prefix);
                    });
                };

                let reg = /(([^\w]\s*(['"])((\/)|(\/\w+.*?))\3)|(\=\/[^\s\>]*))/g;

                content = content.replace(reg, item => replacePrefix(item));

                compilation.assets[key] = {
                    source() {
                        return content;
                    },
                    size() {
                        return content.length;
                    }
                };
            }
        });

        callback();
    });
};

export default MultiPathPlugin;
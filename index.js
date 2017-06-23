/**
 * @file 解决项目部署位置为非域名根目录问题
 * @author mj(zoumiaojiang@gmail.com)
 */

/* eslint-disable */

import minimatch from 'minimatch';

/**
 * MultiPath 插件
 *
 * @constructor
 * @param {Object} options 参数
 */
function MultiPathPlugin(options = {}) {
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

    compiler.plugin('emit', (compilation, callback) => {

        let publicPath = ((compilation.outputOptions.publicPath || '') + '/').replace(/\/{1,}/, '/');

        if (!/\/$/g.test(publicPath)) {
            publicPath = publicPath + '/';
        }

        let ignores = this.ignore;

        ignores.push(publicPath);
        ignores.push(publicPath + '**');
        ignores = uniqArr(ignores);

        Object.keys(compilation.assets).forEach(key => {

            let asset = compilation.assets[key];
            let content = asset.source();

            if (/\.(json|xml)/g.test(key)) {
                content = content.toString();
            }

            if (typeof content === 'string' && !/((vendor)|(\.map$))/.test(key)) {
                let replacePrefix = item => {
                    if (item[0] === '+') {
                        return item;
                    }
                    return item.replace(/\/[^'"?\)]*/g, p => {
                        if (ignoreMatch(ignores, p) || !/[\w\-\_]+\.\w{1,}(\?.*)?$/.test(p)) {
                            return p;
                        }

                        return (publicPath + p).replace(/\/{1,}/g, '/');
                    });
                };

                let reg = /(([^\w]\s*(['"])((\/)|(\/\w+.*?))\3)|(\=\s*?\/\w+[^\s\>]*)|(\(\s*?\/[^\s]*\s*?\)))/g;

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

/**
 * @file 一些公共方法
 * @author LeuisKen <leuisken@foxmail.com>
 */

'use strict';

/**
 * 读取一个文件的文件后缀
 *
 * @param {string} filename 输入的文件名
 * @return {string} 文件后缀
 */
function readFileExt(filename) {
    const list = filename.trim().split('.');
    if (list[0] !== '' && list.length > 1) {
        return list.pop();
    }
    return '';
}

module.exports.readFileExt = readFileExt;

// 按照 issue 的更新时间进行排序
function sorter(a, b) {
    const valueA = (new Date(a.created_at)).getTime();
    const valueB = (new Date(b.created_at)).getTime();
    return valueB - valueA;
}

module.exports.sorter = sorter;

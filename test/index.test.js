/**
 * @file 基础测试
 * @author LeuisKen <leuisken@foxmail.com>
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const mixLoader = require('../lib/index.node').default;

const MOCK_PATH = path.join(__dirname, '../mock');
const PAGE_SIZE = 11;

const locationList = [
    'ant-design/ant-design',
    'vuejs/vue',
    'tensorflow/tensorflow',
    'ElemeFE/element',
    'facebook/react'
];

// 创建一个所有整合所有数据的数组
let combinedDataList = [];

// 将各 mock 数据整合到数组中
for (let i = 0; i < locationList.length; i++) {
    const fileList = fs.readdirSync(`${MOCK_PATH}/${locationList[i]}`)
        .filter(file => readFileExt(file) === 'json')
        .map(file => require(`${MOCK_PATH}/${locationList[i]}/${file}`));
    for (let j = 0; j < fileList.length; j++) {
        combinedDataList = combinedDataList.concat(fileList[j]);
    }
}

// 对整合数组排序
combinedDataList.sort(sorter);

/**
 * 获取 github 某仓库的 issue 列表
 *
 * @param {string} location 仓库路径，如：facebook/react
 */
function* getRepoIssue(location) {
    let page = 1;
    let isLastPage = false;

    while (!isLastPage) {
        let lastRes = getData(location, page);
        isLastPage = lastRes.length < PAGE_SIZE;
        page++;
        yield lastRes;
    }
}

// 合并两个迭代器
const list = mixLoader(locationList.map(location =>
    getRepoIssue(location)), sorter, PAGE_SIZE);

describe('迭代器返回结果测试', () => {
    it('各次迭代结果与预期吻合', async () => {
        while (true) {
            let {value, done} = await list.next();
            if (done) {
                // 迭代完成后，整合数组中不能有剩余数据
                assert.strictEqual(combinedDataList.length, 0);
                break;
            }
            // 对于迭代器的结果与整合数组中的 PAGE_SIZE 个元素做对比
            assert.strictEqual(
                mapToDate(value),
                mapToDate(combinedDataList.splice(0, PAGE_SIZE))
            );
        }
    });

});

// 按照 issue 的更新时间进行排序
function sorter(a, b) {
    const valueA = (new Date(a.created_at)).getTime();
    const valueB = (new Date(b.created_at)).getTime();
    return valueB - valueA;
}

/**
 * 请求数据
 *
 * @param {string} location mock 数据源路径
 * @param {Object} page 页码
 * @return {Array} 结果数组对象
 */
function getData(location, page) {
    return require(`${MOCK_PATH}/${location}/${page}.json`);
}

/**
 * 测试用例对比时，仅关注时间戳是否正确
 * 对于时间戳相同的对象的顺序不予关心
 *
 * @param {Object} value 传入的对象
 * @return {string} 用于比较的字符串
 */
function mapToDate(value) {
    return JSON.stringify(
        value.map(el =>
            (new Date(el.created_at).getTime())
        )
    );
}

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

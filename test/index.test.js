/**
 * @file 基础测试
 * @author LeuisKen <leuisken@foxmail.com>
 */

'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const mixLoader = require('../libnode/index').default;
const {MOCK_PATH, PAGE_SIZE, REPO_LIST} = require('../common/config');
const {sorter, readFileExt} = require('../common/utils');

// 创建一个所有整合所有数据的数组
let combinedDataList = [];

// 将各 mock 数据整合到数组中
for (let i = 0; i < REPO_LIST.length; i++) {
    const fileList = fs.readdirSync(`${MOCK_PATH}/${REPO_LIST[i]}`)
        .filter(file => readFileExt(file) === 'json')
        .map(file => require(`${MOCK_PATH}/${REPO_LIST[i]}/${file}`));
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
const list = mixLoader(REPO_LIST.map(location =>
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

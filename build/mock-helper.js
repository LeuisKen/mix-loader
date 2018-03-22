/**
 * @file 加工 mock 数据
 * @author leuisken <leuisken@foxmail.com>
 */

'use strict';

const fs = require('fs');
const path = require('path');
const {MOCK_PATH, PAGE_SIZE, REPO_LIST} = require('../common/config');
const {readFileExt, sorter} = require('../common/utils');

for (let i = 0; i < REPO_LIST.length; i++) {
    const repoData = fs.readdirSync(`${MOCK_PATH}/${REPO_LIST[i]}`)
        .filter(file => readFileExt(file) === 'json')
        .map(file => require(`${MOCK_PATH}/${REPO_LIST[i]}/${file}`))
        .reduce((cur, next) => cur = cur.concat(next), [])
        // 过滤掉没用的数据，仅保留必须数据，不然控制台输出太多了
        .map(({
            repository_url,
            title,
            created_at
        }) => ({
            repository_url,
            title,
            created_at
        }))
        .sort(sorter);

    for (let j = 1; repoData.length > 0; j++) {
        const text = JSON.stringify(repoData.splice(0, PAGE_SIZE), null, 4);
        fs.writeFileSync(`${MOCK_PATH}/${REPO_LIST[i]}/${j}.json`, text, 'utf8');
    }
}

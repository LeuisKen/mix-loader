/**
 * @file 加工 mock 数据
 * @author leuisken <leuisken@foxmail.com>
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MOCK_PATH = path.join(__dirname, '../mock');
const PAGE_SIZE = 11;

const locationList = [
    'ant-design/ant-design',
    'facebook/react'
];

for (let i = 0; i < locationList.length; i++) {
    const repoData = fs.readdirSync(`${MOCK_PATH}/${locationList[i]}`)
        .map(file => require(`${MOCK_PATH}/${locationList[i]}/${file}`))
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
        .sort((a, b) => b.created_at - a.created_at);

    for (let j = 1; repoData.length > 0; j++) {
        const text = JSON.stringify(repoData.splice(0, PAGE_SIZE), null, 4);
        fs.writeFileSync(`${MOCK_PATH}/${locationList[i]}/${j}.json`, text, 'utf8');
    }
}

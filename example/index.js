/**
 * @file 主逻辑
 * @author LeuisKen <leuisken@foxmail.com>
 */

import mixLoader from '../src';

/**
 * 获取 github 某仓库的 issue 列表
 *
 * @param {string} location 仓库路径，如：facebook/react
 */
async function* getRepoIssue(location) {
    let page = 1;
    let isLastPage = false;

    while (!isLastPage) {
        let lastRes = await getData(
            '/api/issues',
            {location, page}
        );
        isLastPage = lastRes.length === 0;
        page++;
        yield lastRes;
    }
}

// 按照 issue 的更新时间进行排序
function sorter(a, b) {
    const valueA = (new Date(a.created_at)).getTime();
    const valueB = (new Date(b.created_at)).getTime();
    return valueB - valueA;
}

// 合并两个异步迭代器
const list = mixLoader([
    getRepoIssue('ant-design/ant-design'),
    getRepoIssue('facebook/react')
], sorter, 30);

const container = document.getElementById('container');
const btn = document.getElementById('trigger');

btn.addEventListener('click', async function () {
    const {value, done} = await list.next();
    if (done) {
        return;
    }
    container.innerHTML += value.reduce((cur, next) =>
        cur + `<li><div>Repo: ${next.repository_url}</div>`
            + `<div>Title: ${next.title}</div>`
            + `<div>Time: ${next.updated_at}</div>`, '');
});

/**
 * 请求数据，返回 Promise
 *
 * @param {string} url 请求的 url
 * @param {Object} data 请求所带的 query 参数
 * @return {Promise} 用于处理请求的 Promise 对象
 */
function getData(url, data) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            url,
            type: 'GET',
            data,
            success: resolve
        });
    });
}

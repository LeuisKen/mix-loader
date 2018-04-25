/**
 * @file 主逻辑
 * @author LeuisKen <leuisken@foxmail.com>
 */

import {Component} from 'san';
import Scroller from './Scroller';
import mixLoader from '../src';
import {PAGE_SIZE, REPO_LIST} from '../common/config';
import {sorter} from '../common/utils';

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
        isLastPage = lastRes.length < PAGE_SIZE;
        page++;
        yield lastRes;
    }
}

// 合并两个迭代器
const iterator = mixLoader(REPO_LIST.map(location =>
    getRepoIssue(location)), sorter, PAGE_SIZE);

const container = document.getElementById('container');

class App extends Component {
    static template = `
        <div>
            <scroller
                pool="{{pool}}"
                >
                <li s-for="item in list">
                    <div>Repo: {{item.repository_url}}</div>
                    <div>Title: {{item.title}}</div>
                    <div>Time: {{item.created_at}}</div>
                </li>
            </scroller>
        </div>
    `;
    static components = {
        scroller: Scroller
    };
    initData() {
        return {
            pool: iterator
        }
    }
    async getNextPage() {
        const {value, done} = await iterator.next();
        if (done) {
            return;
        }
        const list = this.data.get('list');
        this.data.splice('list', [list.length, 0, ...value]);
    }
}

const app = new App();

app.attach(container);

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

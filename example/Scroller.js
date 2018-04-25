/**
 * @file 无限滚动
 * @author leuisken <leuisken@foxmail.com>
 */
import {Component} from 'san';

export default class Scroller extends Component {
    static template = `
        <div class="scroller" on-scroll="handleListLoad">
            <ul>
                <slot var-list="list"></slot>
            </ul>
            <div s-if="done">以上是全部内容哦~</div>
            <div s-else>正在加载...</div>
        <div>
    `;
    initData() {
        return {
            loading: false,
            done: false,
            list: []
        };
    }
    attached() {
        this.loadPoolData();
    }
    handleListLoad() {
        const clientHeight = this.el.querySelector('ul').clientHeight;

        if (this.el.scrollTop + this.el.clientHeight > clientHeight) {
            const loading = this.data.get('loading');
            if (!loading) {
                this.loadPoolData();
            }
        }
    }
    async loadPoolData() {
        const pool = this.data.get('pool');
        this.data.set('loading', true);
        const {value, done} = await pool.next();
        this.data.set('loading', false);
        if (done) {
            this.data.set('done', true);
            return;
        }
        const list = this.data.get('list');
        this.data.splice('list', [list.length, 0, ...value]);
    }
}

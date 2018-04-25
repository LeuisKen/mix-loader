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
            <div s-elif="loading">正在加载...</div>
        <div>
    `;
    initData() {
        return {
            loading: true,
            done: false
        }
    }
    attached() {
        this.fire('load');
    }
    handleListLoad() {
        const clientHeight = this.el.querySelector('ul').clientHeight;

        if (this.el.scrollTop + this.el.clientHeight > clientHeight) {
            this.fire('load');
        }
    }
}

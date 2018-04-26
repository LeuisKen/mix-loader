/**
 * @file 滚动列表包装器
 * @author leuisken <leuisken@foxmail.com>
 */
import {Component} from 'san';
import Scroller from './Scroller';

export default function ScrollWrapper(pool) {
    return class extends Component {
        static template = `
            <div>
                <scroller
                    list="{= list =}"
                    loading="{= loading =}"
                    done="{= done =}"
                    on-load="loadPoolData"
                    >
                    <slot var-list="list"></slot>
                </scroller>
            </div>
        `;
        static components = {
            scroller: Scroller
        };
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
        async loadPoolData() {
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
}

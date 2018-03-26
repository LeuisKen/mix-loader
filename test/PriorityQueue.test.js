'use strict';

const assert = require('assert');
const PriorityQueue = require('../libnode/PriorityQueue').default;

describe('优先队列测试', () => {
    it('队列长度', () => {
        const pq = new PriorityQueue();
        assert.strictEqual(pq.length, 0);
        pq.push(1);
        assert.strictEqual(pq.length, 1);
        pq.push(2);
        assert.strictEqual(pq.length, 2);
        pq.pop();
        assert.strictEqual(pq.length, 1);
        pq.pop();
        assert.strictEqual(pq.length, 0);
    });
    it('默认比较函数行为', () => {
        const pq = new PriorityQueue();
        const test = [1, 2, 10, 20];
        const arr = [];
        pq.push(...test);
        while(pq.length) {
            arr.push(pq.pop());
        }
        assert.strictEqual(JSON.stringify(arr), JSON.stringify([1, 10, 2, 20]));
    });
    it('传入比较函数', () => {
        const pq = new PriorityQueue((a, b) => a - b);
        const test = [1, 2, 10, 20];
        const arr = [];
        pq.push(...test);
        while(pq.length) {
            arr.push(pq.pop());
        }
        assert.strictEqual(JSON.stringify(arr), JSON.stringify([1, 2, 10, 20]));
    });
    it('队首元素一定是当前队列中最高优先级', () => {
        const pq = new PriorityQueue((a, b) => a - b);
        pq.push(10);
        assert.strictEqual(pq.front(), 10);
        pq.push(15);
        assert.strictEqual(pq.front(), 10);
        pq.push(5)
        assert.strictEqual(pq.front(), 5);
    });
    it('空队列队首返回undefined', () => {
        const pq = new PriorityQueue();
        assert.strictEqual(pq.front(), undefined);
    });
    it('先加入的高优先级元素先出队列', () => {
        const pq = new PriorityQueue((a, b) => a - b);
        const test = [1, 50, 100];
        const arr = [];
        pq.push(...test);
        while(pq.length) {
            arr.push(pq.pop());
        }
        assert.strictEqual(JSON.stringify(arr), JSON.stringify([1, 50, 100]));
    });
    it('后加入的高优先级元素先出队列', () => {
        const pq = new PriorityQueue((a, b) => a - b);
        const test = [100, 50, 1];
        const arr = [];
        pq.push(...test);
        while(pq.length) {
            arr.push(pq.pop());
        }
        assert.strictEqual(JSON.stringify(arr), JSON.stringify([1, 50, 100]));
    });
    it('空队列队出队返回undefined', () => {
        const pq = new PriorityQueue();
        assert.strictEqual(pq.pop(), undefined);
    });
    it('动态添加/移除元素, 出队元素一定是当前队列中最高优先级', () => {
        const pq = new PriorityQueue((a, b) => a - b);
        const arr = [];
        pq.push(10, 20, 30);
        arr.push(pq.pop(), pq.pop());
        pq.push(0, 40);
        arr.push(pq.pop(), pq.pop(), pq.pop());
        assert.strictEqual(JSON.stringify(arr), JSON.stringify([10, 20, 0, 30, 40]));
    });
});

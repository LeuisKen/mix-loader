/**
 * @file MixLoader
 * @author LeuisKen <leuisken@foxmail.com>
 *         STLighter <123939775@qq.com>
 */

import groupBy from 'lodash.groupby';
import PriorityQueue from './PriorityQueue';

/**
 * 合并多个异步迭代器，返回一个新的异步迭代器
 * 该迭代器每次返回 pickNumber 个数据
 * 数据按照 sortFn 排序
 *
 * @param {Array} iterators 异步迭代器数组对象
 * @param {Function} sortFn 对请求结果进行排序的函数
 * @param {number} pickNumber 迭代器每次返回的元素数量
 */
export default async function* mixLoader(iterators, sortFn, pickNumber) {
    // 结果集, 用于保存要返回的数据
    const dataSet = [];
    // 用于保存待消费数据的优先队列
    const dataQueue = new PriorityQueue((a, b) => sortFn(a.value, b.value));
    // 数据源列表
    const dataSources = iterators.map(iterator => ({
        // 还未消费的数据数量(在优先队列中, 但不在结果集中)
        poolSize: 0,
        // 还未返回的数据请求
        req: null,
        // 请求数据的迭代器
        iterator
    }));

    // 还有数据可以返回
    while (dataSources.length > 0 || dataQueue.length) {
        // 数据源分组
        const {drySrc, dryingSrc} = groupBy(dataSources, sourceSeparator);
        // 对于余量为 0 的数据源
        // 策略为获取一次数据, 并需要等待返回
        const reqs = drySrc.map(src => src.req || src.iterator.next());
        // 对于余量大于 0 小于 pickNumber 的数据源
        // 策略为预先获取一次数据, 但不需要等待返回
        dryingSrc.forEach(src => src.req = src.iterator.next());

        // 等待所有余量为 0 的数据源返回，保证每个数据源都有数据在优先队列中
        const res = await Promise.all(reqs);
        for (let i = 0; i < res.length; i++) {
            // 根据返回结果更新数据队列与数据源列表
            updateData(drySrc[i], res[i]);
        }

        // 使用优先队列将数据按序放入结果集
        while (dataSet.length < pickNumber && dataQueue.length) {
            // 将最优先的一条数据从队列移除, 并放入结果集中
            const item = dataQueue.pop();
            dataSet.push(item.value);
            // 对应数据源未消费数据减少1
            --item.src.poolSize;
            // 如果此时数据源待消费数据量为0, 且结果集数据不足, 需要等待此数据源迭代器返回新数据
            if (!item.src.poolSize && dataSet.length < pickNumber) {
                // 由于目前的与获取策略, 只会走item.src.req, 后者用于兼容不同的预获取策略
                item.src.req = item.src.req || item.src.iterator.next();
                const result = await item.src.req;
                updateData(item.src, result);
            }
        }

        // 从结果中取出 pickNumber 个数据
        yield dataSet.splice(0, pickNumber);
    }

    /**
     * 根据待消费数据余量，对数据源进行分组
     *
     * @param {Object} source 数据源
     * @return {string} 分组的 key 名
     */
    function sourceSeparator(source) {
        // 所有待消费数据余量为0的数据源
        if (source.poolSize === 0) {
            return 'drySrc';
        }
        // 所有待消费数据余量不足pickNumber的数据源
        else if (source.poolSize < pickNumber && !source.req) {
            return 'dryingSrc';
        }
        return 'other';
    }

    /**
     * 根据迭代器的返回数据，更新数据队列与数据源列表
     *
     * @param {Object} source 迭代器对应的数据源
     * @param {Object} result 迭代器的返回值
     */
    function updateData(source, result) {
        const {value, done} = result;
        source.req = null;
        // 如果该迭代器未迭代完, 将数据放入优先队列中
        if (!done) {
            dataQueue.push(...value.map(value => ({
                value,
                src: source
            })));
            source.poolSize += value.length;
        }
        // 否则, 将数据源从列表中移除
        else {
            dataSources.splice(dataSources.indexOf(source), 1);
        }
    }

}

/**
 * @file MixLoader
 * @author LeuisKen <leuisken@foxmail.com>
 */

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
    // 用于保存结果的数组
    let dataSet = [];
    // 需要请求的迭代器列表
    let activeIterators = iterators.slice();
    // 每个迭代器返回的数据中还未显示的数量
    let unpickCount = Array(iterators.length).fill(0);

    // 还有迭代器可以请求时
    while (activeIterators.length > 0) {
        // 所有已返回数据余量不足pickNumber的迭代器请求一次
        const reqs = activeIterators.map((iter, idx) => (
            unpickCount[idx] < pickNumber ? iter.next() : {
                value: [],
                done: false
            }
        ));
        let res = await Promise.all(reqs);

        for (let i = 0; i < res.length; i++) {
            let {value, done} = res[i];
            console.log(value, done);
            // 如果该迭代器未迭代完，将请求到的数组，合并到结果中
            if (!done) {
                dataSet = dataSet.concat(value.map(val => ({val, i})));
                unpickCount[i] += value.length;
            }
            // 否则，当数据余量为0时, 将其迭代器和余量计数从数组中移除
            else if (unpickCount[i] === 0) {
                activeIterators.splice(i, 1);
                unpickCount.splice(i, 1);
            }
        }

        // 对结果排序
        dataSet.sort((a, b) => sortFn(a.val, b.val));

        // 从结果中取出 pickNumber 个数据
        console.log(dataSet);
        yield dataSet.splice(0, pickNumber).map(data => {
            --unpickCount[data.i];
            return data.val;
        });
    }

}

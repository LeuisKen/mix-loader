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
    // 数据源列表
    let dataSources = iterators.map(iterator => {
        return {
            // 迭代器返回还未消费的数据数量
            poolSize: 0,
            // 请求数据的迭代器
            iterator
        };
    });

    // 还有数据可以返回
    while (dataSources.length > 0) {
        // 所有数据余量不足pickNumber的数据源
        const drySrc = dataSources.filter(src => src.poolSize < pickNumber);
        // 这些数据源需使用迭代器获取一次数据
        const reqs = drySrc.map(src => src.iterator.next());
        let res = await Promise.all(reqs);

        for (let i = 0; i < res.length; i++) {
            let {value, done} = res[i];
            // 如果该迭代器未迭代完，将请求到的数组，合并到结果中
            if (!done) {
                dataSet = dataSet.concat(value.map(value => {
                    return {
                        value,
                        src: drySrc[i]
                    };
                }));
                drySrc[i].poolSize += value.length;
            }
            // 否则，将数据源从列表中移除
            else {
                dataSources.splice(dataSources.indexOf(drySrc[i]), 1);
            }
        }

        // 对结果排序
        dataSet.sort((a, b) => sortFn(a.value, b.value));

        // 从结果中取出 pickNumber 个数据
        yield dataSet.splice(0, pickNumber).map(data => {
            --data.src.poolSize;
            return data.value;
        });
    }

}

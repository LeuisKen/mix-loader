"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _promise = require("babel-runtime/core-js/promise");

var _promise2 = _interopRequireDefault(_promise);

var _asyncGenerator2 = require("babel-runtime/helpers/asyncGenerator");

var _asyncGenerator3 = _interopRequireDefault(_asyncGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
exports.default = (() => {
    var _ref = _asyncGenerator3.default.wrap(function* (iterators, sortFn, pickNumber) {
        // 用于保存结果的数组
        let dataSet = [];
        // 数据源列表
        let dataSources = iterators.map(function (iterator) {
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
            const drySrc = dataSources.filter(function (src) {
                return src.poolSize < pickNumber;
            });
            // 这些数据源需使用迭代器获取一次数据
            const reqs = drySrc.map(function (src) {
                return src.iterator.next();
            });
            let res = yield _asyncGenerator3.default.await(_promise2.default.all(reqs));

            for (let i = 0; i < res.length; i++) {
                let { value, done } = res[i];
                // 如果该迭代器未迭代完，将请求到的数组，合并到结果中
                if (!done) {
                    dataSet = dataSet.concat(value.map(function (value) {
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
            dataSet.sort(function (a, b) {
                return sortFn(a.value, b.value);
            });

            // 从结果中取出 pickNumber 个数据
            yield dataSet.splice(0, pickNumber).map(function (data) {
                --data.src.poolSize;
                return data.value;
            });
        }
    });

    function mixLoader(_x, _x2, _x3) {
        return _ref.apply(this, arguments);
    }

    return mixLoader;
})();

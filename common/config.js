/**
 * @file 配置项
 * @author LeuisKen <leuisken@foxmail.com>
 */

'use strict';

const path = require('path');

module.exports.PAGE_SIZE = 11;

module.exports.MOCK_PATH = path.join(__dirname, '../mock');

module.exports.REPO_LIST = [
    'ant-design/ant-design',
    'vuejs/vue',
    'tensorflow/tensorflow',
    'ElemeFE/element',
    'facebook/react'
];

/**
 * @file 开发使用的 express 服务器
 * @author LeuisKen <leuisken@foxmail.com>
 */

'use strict';

const path = require('path');
const express = require('express');
const Bundler = require('parcel-bundler');
const {MOCK_PATH} = require('../common/config');

const file = path.join(__dirname, '../example/index.html');
const options = {};
const bundler = new Bundler(file, options);

const app = express();

app.use('/api', function (req, res) {
    const {location, page} = req.query;
    const mockEntry = `${MOCK_PATH}/${location}/${page}.json`;
    const mockData = require(mockEntry);
    res.json(mockData);
});

app.use(bundler.middleware());

app.listen(8080);

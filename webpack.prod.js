const MinifyPlugin = require('babel-minify-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const common = require('./webpack.common.js');

const config = {
    entry: './src/main.js',
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    presets: ['env'],
                },
            }
        ]
    },
    plugins: [
        new MinifyPlugin,
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        }),
    ],
    devtool: 'source-map',
};

const minifyWithPolyfills = Object.assign({}, config, {
    entry: ['babel-polyfill', './src/main.js'],
    output: {
        filename: 'geokeyboard.min.pf.js',
        path: path.resolve(__dirname, 'dist')
    },
});

const minify = Object.assign({}, config, {
    output: {
        filename: 'geokeyboard.min.js',
        path: path.resolve(__dirname, 'dist')
    },
});

const production = merge(common, Object.assign({}, config, {
    plugins: [],
}));

module.exports = [minifyWithPolyfills, minify, production];
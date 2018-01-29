const path = require('path');

module.exports = {
    entry: ['babel-polyfill', './src/index.js'],
    output: {
        filename: 'geokeyboard.js',
        path: path.resolve(__dirname, 'dist')
    }
};
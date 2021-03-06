const path = require('path');

module.exports = {
    entry: ['babel-polyfill', './src/main.js'],
    output: {
        filename: 'geokeyboard.js',
        path: path.resolve(__dirname, 'dist')
    }
};
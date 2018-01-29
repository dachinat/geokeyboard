const path = require('path');

module.exports = {
    entry: ['./src/main.js'],
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
    output: {
        filename: 'geokeyboard.dev.js',
        path: path.resolve(__dirname, 'dist')
    },
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist'
    }
};
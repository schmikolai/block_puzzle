const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    mode: "development",
    resolve: {
        extensions: [".ts", ".js"]
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader" }
        ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'docs'),
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                {from: "public", to: "."}
            ]
        })
    ],
    devServer: {
        // contentBase: path.join(__dirname, 'dist'),
        port: 3000,
    }
}
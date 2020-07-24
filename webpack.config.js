module.exports = {
    // change to .tsx if necessary
    entry: './src/app.ts',
    output: {
        filename: './api/app.js',
        path: __dirname
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    module: {
        rules: [
            // changed from { test: /\.jsx?$/, use: { loader: 'babel-loader' }, exclude: /node_modules/ },
            { test: /\.(t|j)sx?$/, use: { loader: 'ts-loader' }, exclude: /node_modules/ },

            // addition - add source-map support
            { enforce: 'pre', test: /\.js$/, exclude: /node_modules/, loader: 'source-map-loader' }
        ]
    },
    // addition - add source-map support
    devtool: 'source-map'
};

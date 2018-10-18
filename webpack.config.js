const path = require('path');

const CleanPlugin = require('clean-webpack-plugin');
const HtmlPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const NodeSass = require('node-sass');
const SpeedMeasurePlugin = require('speed-measure-webpack-plugin');

module.exports = function (env) {
    const dir = {
        source: 'src',
        output: 'dist',
        libs: 'node_modules'
    };

    const entry = {
        'index': `./${dir.source}/app/static/main/index.js`
    };

    const plugins = [
        new CleanPlugin([`./${dir.output}`]),
        new MiniCssExtractPlugin({ filename: '[name].bundle.css' })
    ];
    Object.entries(entry)
            .map(([name, entryPoint]) => {
                return new HtmlPlugin({
                    chunks: [name],
                    filename: `${name}.html`,
                    inject: 'head',
                    template: path.join(path.dirname(entryPoint), `${path.basename(entryPoint, '.js')}.html`)
                });
            })
            .forEach(it => plugins.push(it));

    // KISS until otherwise required - it's only a small app
    const optimization = {
        minimize: false,
        minimizer: []
    };

    const output = {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, dir.output)
    };

    const rules = [
        {
            // JavaScript
            test: /\.js$/,
            exclude: /node_modules/,
            use: [
                { loader: 'babel-loader' }
            ]
        },
        {
            // Stylesheets
            test: /\.s?css$/,
            use: [
                MiniCssExtractPlugin.loader,
                {
                    loader: 'css-loader',
                    options: { sourceMap: true }
                },
                {
                    loader: 'postcss-loader'
                },
                {
                    // See: https://webpack.js.org/loaders/sass-loader/#problems-with-url-
                    loader: 'resolve-url-loader'
                },
                {
                    loader: 'sass-loader',
                    options: {
                        implementation: NodeSass,
                        includePaths: [dir.libs],
                        precision: 4,

                        // Insert a comment for each selector to mark which file it was originally defined in
                        sourceComments: true,

                        // 'resolve-url-loader' requires source maps to do its job
                        sourceMap: true
                    }
                }
            ]
        }
    ];

    const speedMeasurePlugin = new SpeedMeasurePlugin({ outputFormat: 'human' });
    return speedMeasurePlugin.wrap({
        devtool: 'source-map',
        entry,
        mode: 'production',
        module: { rules },
        optimization,
        output,
        plugins
    });
};

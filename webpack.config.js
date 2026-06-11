// Generated using webpack-cli https://github.com/webpack/webpack-cli

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const webpack = require('webpack')


const smp = new SpeedMeasurePlugin({
    outputFormat: "humanVerbose",
    loaderTopFiles: 10,
});

const isProduction = process.env.NODE_ENV == 'production';


const stylesHandler = isProduction ? MiniCssExtractPlugin.loader : 'style-loader';

const PUBLIC_URL = process.env.PUBLIC_URL || '';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3007';


const config = smp.wrap({
    entry: ['./src/index.js'],
    resolve: {
        extensions: ['.jsx', '.js', '.tsx']
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        // Dev server needs absolute publicPath so /feed loads /main.js, not /feed/main.js.
        // Production/Capacitor keeps relative paths for file:// and packaged assets.
        publicPath: isProduction ? './' : '/',
        filename: '[name].js',
        chunkFilename: '[name].js',
        clean: true,
    },
    devServer: {
        open: true,
        host: 'localhost',
        port: 3000,
        historyApiFallback: true,
        static: {
            directory: path.join(__dirname, 'public'),
        },
        client: {
            overlay: {
                errors: false,
                warnings: false,
            },
        },
        compress: true,
    },
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin()],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'index.html',
        }),
        new webpack.DefinePlugin({
            // 'process.env': JSON.stringify(process.env), // Define all process.env variables
            'process.env.PUBLIC_URL': JSON.stringify(PUBLIC_URL),
            'process.env.REACT_APP_API_URL': JSON.stringify(API_URL),
        }),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public' }
            ]
        })

        // Add your plugins here
        // Learn more about plugins from https://webpack.js.org/configuration/plugins/
    ],
    module: {
        rules: [
            {
                test: /\.(bin|wasm|weights)$/,
                type: 'asset/resource',
                generator: {
                    filename: '[hash][ext][query]'
                }
            },
            {
                test: /\.css$/i,
                use: [stylesHandler, 'css-loader'],
            },
            {
                test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
                type: 'asset',
            },

            // Add your rules for custom modules here
            // Learn more about loaders from https://webpack.js.org/loaders/
            {
                test: /\.js$/, // Apply to all .js files
                exclude: /node_modules/, // Exclude node_modules
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },
            {
                test: /\.jsx$/, // Apply to all .js files
                exclude: /node_modules/, // Exclude node_modules
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            }
        ],
    },
});

module.exports = () => {
    if (isProduction) {
        config.mode = 'production';

        config.plugins.push(new MiniCssExtractPlugin());


    } else {
        config.mode = 'development';
    }
    return config;
};

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = (env) => ({
    mode: !env.production ? 'development' : 'production',
    stats: 'minimal',
    entry: {
        app: './src/index.tsx',
        interceptServiceWorker: './src/interceptServiceWorker.ts',
        playground: './src/containers/Playground/playground-index.ts',
        'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
        'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
        'css.worker': 'monaco-editor/esm/vs/language/css/css.worker',
        'html.worker': 'monaco-editor/esm/vs/language/html/html.worker',
        'ts.worker': 'monaco-editor/esm/vs/language/typescript/ts.worker',
    },
    output: {
        globalObject: 'self',
        path: path.resolve(__dirname, './docs'),
        filename: (pathData) => {
            if (pathData.chunk.name === 'interceptServiceWorker') {
                return '[name].js';
            }
            return '[name].index.js';
        },
    },
    resolve: {
        extensions: ['.ttf', '.jsx', '.js', '.tsx', '.ts', '.css'],
    },
    optimization: {
        sideEffects: true,
    },
    module: {
        rules: [
            {
                test: /\.(js|ts)x?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            '@babel/preset-env',
                            '@babel/preset-typescript',
                            '@babel/preset-react',
                        ],
                        plugins: [
                            !env.production &&
                                require.resolve('react-refresh/babel'),
                        ].filter(Boolean),
                    },
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.ttf$/,
                use: ['file-loader'],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.html',
            excludeChunks: ['playground', 'qrcodejs'],
        }),
        new HtmlWebpackPlugin({
            template: './src/containers/Playground/playground.html',
            filename: 'playground.html',
            title: 'Playground',
            excludeChunks: [
                'qrcodejs',
                'app',
                'editor.worker',
                'json.worker',
                'css.worker',
                'html.worker',
                'ts.worker',
            ],
            chunks: ['playground'],
            scriptLoading: 'module',
            scriptLoading: 'defer',
        }),
        !env.production && new ReactRefreshWebpackPlugin(),
    ].filter(Boolean),
    devServer: {
        hot: true,
        client: {
            logging: 'none',
            overlay: false,
        },
        static: {
            directory: path.resolve(__dirname, './dist'),
        },
    },
});

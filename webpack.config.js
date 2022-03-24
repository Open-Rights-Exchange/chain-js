const path = require("path");
const webpack = require('webpack');

const isProduction = process.env.NODE_ENV == "production";
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const baseConfig = {
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: "ts-loader",
        exclude: ["/node_modules/"],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: "asset",
      }
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  plugins: []
};


const serverConfig = {
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lib.node.js',
  },
  entry: baseConfig.entry,
  module: baseConfig.module,
  resolve: baseConfig.resolve,
  plugins: baseConfig.plugins,
  resolve: {
    extensions: baseConfig.resolve.extensions,
  },
};

const clientConfig = {
  target: 'web', // <=== can be omitted as default is 'web'
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'lib.js',
    library: { 
      name :'chain_js',
      type: 'umd'
    }
  },
  entry: baseConfig.entry,
  module: baseConfig.module,
  resolve: baseConfig.resolve,
  plugins: baseConfig.plugins,
  resolve: {
    extensions: baseConfig.resolve.extensions,
    fallback: {
      "buffer": require.resolve("buffer/"),
      "encoding": false,
      "memcpy": false,
      "zlib": false,
      "path": false,
      "querystring": false,
      "os": false,
      "http": false,
      "stream": false,
      "https": false,
      "crypto": require.resolve("crypto-browserify"),
      "electron": false,
      "fs": false,
      "net": false,
      "tls": false
    }
  },
};


const devProd = (tempConfig) => {
  if (isProduction) {
    tempConfig.mode = "production";
  } else {
    tempConfig.mode = "development";
    tempConfig.optimization =  {
      usedExports: true,
      innerGraph: true,
      sideEffects: true,
    };
    tempConfig.devtool = false;
    //tempConfig.plugins = [new BundleAnalyzerPlugin({analyzerPort: 5000})]
    tempConfig.plugins = [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ]
  }
  return tempConfig;
};

var _serverConfig = devProd(serverConfig);
var _clientConfig = devProd(clientConfig);
// console.log(_serverConfig)
//console.log(_clientConfig)
module.exports = () => [
  //devProd(_serverConfig),
  devProd(_clientConfig)
]

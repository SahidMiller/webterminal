const NodePolyfillPlugin = require("node-stackify/plugin");
const path = require("path");
const webpack = require("webpack");
const { ModuleFederationPlugin } = webpack.container;
const HtmlWebpackPlugin = require("html-webpack-plugin");

const mainApp = {
  entry: "./src/App.js",
  output: {
    path: path.resolve("./dist"),
  },
  mode: "development",
  target: "web",
  module: {
    rules: [
      {
        test: /\.m?js(x?)$/,
        include: path.resolve(__dirname, "src"),
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              [
                "@babel/plugin-transform-react-jsx",
                {
                  pragma: "h",
                  pragmaFrag: "Fragment",
                },
              ],
            ],
          },
        },
      },
      {
        test: /\.html$/,
        use: [
          {
            loader: "html-loader",
            options: {
              esModule: false,
            },
          },
        ],
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(png|jpe?g|gif|woff2|woff|mp3|ttf|svg|eot)$/,
        loader: "file-loader",
        options: {
          esModule: false,
        },
      },
    ],
  },
  resolve: {
    alias: {
      fs:false,
      //React
      //Proper alias if using npm/yarn link
      react: require.resolve("preact/compat"),
      "react-dom": "preact/compat",
      // Not necessary unless you consume a module using `createClass`
      "create-react-class": "preact/compat/lib/create-react-class",
      // Not necessary unless you consume a module requiring `react-dom-factories`
      "react-dom-factories": "preact/compat/lib/react-dom-factories",
      "web-streams-polyfill": require.resolve("web-streams-polyfill"),
    },
  },
  plugins: [
    new NodePolyfillPlugin({
      excludeAliases: ["fs"]
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "./index.html"),
      filename: "index.html",
      inject: "body",
      publicPath: "./",
    }),
    new webpack.ProvidePlugin({
      "ReadableStream": ["web-streams-polyfill", "ReadableStream"],
      "WritableStream": ["web-streams-polyfill", "WritableStream"]
    })
  ],
};

const serviceWorker = {
  entry: "./src/workers/service-worker/index.js",
  output: {
    path: path.resolve("./dist/"),
    filename: "service-worker.js",
    chunkFilename: 'service-worker/[name].js'
  },
  mode: "development",
  target: "webworker",
  resolve: {
    alias: {
      "web-streams-polyfill": require.resolve("web-streams-polyfill"),
    }
  },
  plugins: [
    new NodePolyfillPlugin(),
    new webpack.ProvidePlugin({
      "ReadableStream": ["web-streams-polyfill", "ReadableStream"],
      "WritableStream": ["web-streams-polyfill", "WritableStream"]
    })
  ],
};

const nodeWorker = {
  entry: "./src/workers/worker-process/index.js",
  output: {
    path: path.resolve("./dist"),
    filename: "worker.js",
    chunkFilename: 'worker/[name].js'
  },
  mode: "development",
  target: "webworker",
  resolve: {
    alias: {
      tty: require.resolve("./polyfills/tty.js"),
      fs: require.resolve("./src/workers/worker-process/fs-proxy.cjs"),
      "web-streams-polyfill": require.resolve("web-streams-polyfill"),
    },
  },
  plugins: [
    new NodePolyfillPlugin({
      excludeAliases: ["tty", "fs"]
    }),
    new webpack.ProvidePlugin({
      "ReadableStream": ["web-streams-polyfill", "ReadableStream"],
      "WritableStream": ["web-streams-polyfill", "WritableStream"]
    })
  ],
};

module.exports = [mainApp, serviceWorker, nodeWorker];

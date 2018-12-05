const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const I18nPlugin = require('i18n-webpack-plugin');

const ISPRODUCTION = process.env.NODE_ENV === 'production';
const languages = {
  en: null,
  'ru-ru': require('./locale/ru-ru'),
};

module.exports = Object.keys(languages).map((language) => {
	let devtool = 'source-map';
	
	let plugins = [
	  new ExtractTextPlugin('[name].css'),
	  new HtmlWebpackPlugin(),
	  new webpack.NamedModulesPlugin(),
      new webpack.NoEmitOnErrorsPlugin(),
	  new I18nPlugin(languages[language]),
	];
	
	let mode = 'development';
	
	if (ISPRODUCTION) {
      devtool = false;
      mode = 'production';
    } else {
      plugins = plugins.concat(new webpack.HotModuleReplacementPlugin());
    }
	
	const config = {
	  name: language,
      mode: mode,
      entry: path.join(__dirname, '/lib/app.jsx'),
      output: {
        publicPath: 'http://127.0.0.1:8081/build/',
        path: path.join(__dirname, '/build/'),
        filename: language + '.app.js',
      },
      resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      },
	  module: {
		 rules: [
          {
            exclude: /node_modules/,
            test: /\.jsx?$/,
            use: {
              loader: 'babel-loader',
              options: {
                  plugins: [ 
				    "react-hot-loader/babel", 
					["@babel/plugin-proposal-decorators", { "legacy": true }],
					"@babel/plugin-proposal-class-properties"
                  ],
                  babelrc: false,
                  presets: [ '@babel/env', '@babel/react' ],
                  ignore: [ 'node_modules' ]
              },
            },
          },
          {
              test: /\.css$/,
              loader: ['style-loader', 'css-loader']
          },
          {
              test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
			  use: {
				loader: 'url-loader',
				options: {
					limit: 10000,
					minetype: 'application/font-woff',
					name: '[name].[ext]'
				},
			  }
          },
          {
              test: /\.(ttf|eot|otf)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
			  use: {
				loader: 'url-loader',
				options: {
					limit: 10000,
					minetype: 'application/font-woff',
					name: '[name].[ext]'
				},
			  }
          },
          {
              test: /\.svg\?v=[0-9]\.[0-9]\.[0-9]$/,
			  use: {
				loader: 'url-loader',
				options: {
					limit: 10000,
					minetype: 'application/font-woff',
					name: '[name].[ext]'
				},
			  }
          },
          {
              test: /\.(svg|png|jpg|jpeg|ico)$/,
			  use: {
				loader: 'url-loader',
				options: {
					limit: 25000,
					name: '[name].[ext]'
				},
			  }
          },
          {
            test: /\.json$/,
            use: {
              loader: 'json',
            }
          }
        ],
	  },
	  plugins: plugins,
      devtool: devtool,
      node: {
        __dirname: true,
      },
	};
	
	if (ISPRODUCTION) {
      config.output.publicPath = '/build/';
    }
    return config;
});

module.exports.output = {
  publicPath: 'http://127.0.0.1:8081/build/',
};
module.exports.devServer = {};
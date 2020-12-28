// 兼容到 IE9
const path = require('path');
const glob = require('glob');
const webpack = require('webpack');
const SpritesmithPlugin = require('webpack-spritesmith');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
// const CopyWebpackPlugin = require('copy-webpack-plugin');


var entries = getEntry('app/public/entry/*.js');

function getEntry(globPath) {
  var files = glob.sync(globPath);
  // console.log(files)
  var entries = {},
    entry,
    dirname,
    dirname2,
    basename,
    pathname,
    extname;

  for (var i = 0; i < files.length; i++) {
    entry = files[i];
    dirname = path.dirname(entry);
    extname = path.extname(entry);
    basename = path.basename(entry, extname);
    pathname = path.join(dirname, basename);
    // console.log(dirname, extname, basename, pathname)
    entries[basename] = './' + entry;
  }
  return entries;
}


module.exports = (env, argv) => {
  const mode = argv.mode;
  let plugins = [];
  let suffix = new Date().getTime();

  if (mode === 'development') {
    plugins.push(new webpack.HotModuleReplacementPlugin());
  } else {
    suffix = '[contenthash:8]';
    plugins.push(new OptimizeCSSAssetsPlugin(), new CleanWebpackPlugin());// 压缩css
  }

  let config = {
    mode: argv.mode,
    entry: entries,
    plugins: [
      ...plugins,
      new webpack.DefinePlugin({
        'process.env': mode,
        IS_DEV: JSON.stringify(mode === 'development'),
      }),
      new SpritesmithPlugin({
        src: {
          cwd: path.resolve(__dirname, 'app/public/images/icons'),
          glob: '*.png'
        },
        spritesmithOptions: {
          padding: 8
        },
        target: {
          image: path.resolve(__dirname, 'app/public/images/icon-sprites.png'),
          css: [
            [
              path.resolve(__dirname, 'app/public/scss/_icon.scss'),
              {
                format: 'handlebars_based_template'
              }
            ]
          ]
        },
        apiOptions: {
          //css 引入雪碧图的路径。根目录：/ => public
          cssImageRef: `../images/icon-sprites.png`,
        },
        customTemplates: {
          'handlebars_based_template': './scss.template.handlebars'
        }
      }),
      new MiniCssExtractPlugin({
        filename: '[name].css?t=' + suffix,
        chunkFilename: '[name].css?t=' + suffix,
      }),
      new ManifestPlugin({
        fileName: path.join(__dirname, './config/manifest.json'),
      }),
      /*new CopyWebpackPlugin([
         {
             from: path.join(__dirname, 'app/public/plug/jBox'),
             to: path.join(__dirname, 'app/public/dist'),
             ignore: ['.*']
         },
         {
             from: path.join(__dirname, 'app/public/plug/jquery.js'),
             to: path.join(__dirname, 'app/public/jquery.js'),
             ignore: ['.*']
         }
     ]),*/
    ],
    devtool: (mode === 'production') ? 'source-map' : '',// source-map 会影响打包速度，所以只应用于生产环境
    output: {
      filename: '[name].js?t=' + suffix,
      path: path.resolve(__dirname, `./app/public/dist`),
      publicPath: '/public/dist/'
    },
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            name: 'common',
            chunks: 'initial', // initial表示提取入口文件的公共css及js部分
            minChunks: 2, // 表示提取公共部分最少的文件数
            minSize: 0,// 表示提取公共部分最小的大小
            // 如果发现页面中未引用公共文件，加上enforce: true
          },
          /* styles: {
               name: 'styles',
               test: /\.scss$/,
               chunks: 'initial',
               // enforce: true
           }*/
        }
      },
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            MiniCssExtractPlugin.loader,// 分离css
            'style-loader',
            'css-loader',
          ]
        },
        {
          test: /\.scss$/,
          use: [
            MiniCssExtractPlugin.loader,// 分离css
            'css-loader',
            'postcss-loader',// 添加css前缀
            'sass-loader',
          ]
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          include: [
            path.resolve(__dirname, './app/public/')
          ],
          use: [
            {
              loader: 'babel-loader',
              /* options: {
                   presets: ['es2015']
               }*/
             /* options: {
                cacheDirectory: mode === 'development' // 设置缓存
              }*/
            }
          ]
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          use: [
            {
              loader: 'url-loader',
              options: {
                limit: 5000,
                name: '[name].[ext]?t=' + suffix,
                // outputPath: './',//相对于输出的js
                publicPath: './'
              }
            }
          ]
        }
      ]
    }
  };
  return config;
};


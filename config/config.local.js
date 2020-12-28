/*export default () => {
    let config = {};
    const webpackConfig = require('../webpack.config.js');
    config.webpack = {
        webpackConfigList: [webpackConfig(null, {mode: 'development'})],
    };
    return config;
}*/


const webpackConfig = require('../webpack.config.js');

exports.webpack={
    webpackConfigList: [webpackConfig(null, {mode: 'development'})],
};

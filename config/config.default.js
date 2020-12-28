/* eslint valid-jsdoc: "off" */
const path = require("path");
'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1567215790094_9874';

  // add your middleware config here
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };
  config.view = {
    defaultViewEnngine: 'nunjucks',
    mapping: {
      '.html': 'nunjucks',
    }
  };
  config.static = {
    dir: path.join(appInfo.baseDir, 'app/public'),
    prefix: '/public/',
  };
  return {
    ...config,
    ...userConfig,
  };
};

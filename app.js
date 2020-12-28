const path = require('path');
const _ = require('lodash');

class AppBootHook {
  constructor(app) {
    this.app = app;
  }

  async didReady() {
    const ctx = await this.app.createAnonymousContext();

    if (this.app.config.env === 'local') {
      // egg 会自动读取内存中 webpack打包出来的资源，并返回给浏览器
      const FileSystem = require('egg-webpack').FileSystem;
      const fileSystem = new FileSystem(this.app);
      const fileContent = await fileSystem.readWebpackMemoryFile(path.join(__dirname, './config/manifest.json'), '');
      this.app.locals.manifest = JSON.parse(fileContent);

    } else {
      this.app.locals.manifest = require('./config/manifest');
    }

    this.app.locals.timeStamp = new Date(); // 时间戳
  }
}

module.exports = AppBootHook;

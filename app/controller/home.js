'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
    async index() {
        const {ctx} = this;
        var data = {
            city: '东莞',
            date:new Date(),
        };
        await ctx.render('index2019.html', data);
    }
}

module.exports = HomeController;

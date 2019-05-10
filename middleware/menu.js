// todo 到时候写成接口调用一次即可，或者菜单配置有修改的时候在进行调用，防止次数超过。
let request = require('request');
let menu = require('../util/menu');

module.exports = function(config) {
    return async function(ctx, next) {
        let url = `${config.baseUrl}menu/create?access_token=${ctx.access_token}`;
        return new Promise((resolve, reject) => {
            request({url: url, method: 'POST', body: menu, json: true}, (err, response, body) => {
                if(err) throw err;

                if(body.errcode === 0) {
                    resolve();
                }
                else {
                    throw new Error('create menu failed!');
                }
            })
        }).
        then(async () => {
            await next();
        })
    }
}
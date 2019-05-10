let sha1 = require('sha1');

module.exports = function(config) {
    return async function(ctx, next) {
        let token = config.weChat.token;
        let signature = ctx.query.signature;
        let nonce = ctx.query.nonce;
        let timestamp = ctx.query.timestamp;
        let echostr = ctx.query.echostr;
        let str = [token, timestamp, nonce].sort().join('');
        let sha = sha1(str);
        if (ctx.request.method === "GET") {
            if(sha === signature) {
                ctx.body = echostr + '';
            }
            else {
                console.log('get fail');
            }
        } else if (ctx.request.method === "POST") {
            if (!sha == signature) {
                console.log("post fail");
                return false;
            }
        }
        await next();
    }
}
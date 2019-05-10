// 弃用，后期再删除，改为直接使用koa-xml-body解析
let getRawBody = require("raw-body");
let parseString = require('xml2js').parseString;
let processingMsg = require('../util/processingMsg');
let request = require('request');

module.exports = function(config) {
    return async function(ctx, next) {
        if (ctx.request.method === "POST") {
            let text = await getRawBody(ctx.req, {
                length: ctx.length,
                limit: "1mb",
                encoding: "utf8"
            });
            await parseString(text, (err, result) => {
                if(err) throw err;

                console.log("result", result.xml);
                let msg = processingMsg(result.xml);
                console.log("msg", msg);
                ctx.body = msg;
                ctx.status = 200;
                ctx.type = 'application/xml';
                console.log("ctx.body", ctx.body);
            })
        }
        console.log(".....");
        await next();
    }
}
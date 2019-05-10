// 原生组件引入
const Koa = require('koa');
const app = new Koa();
const xmlParser = require('koa-xml-body');
const Router = require('koa-router');
const router = new Router();

// 中间件引入
let signature = require('./middleware/signature');
let accessToken = require('./middleware/accessToken');
let menu = require('./middleware/menu');

// 其他组件引入
let config = require('./config');
let processingMsg = require('./util/processingMsg');

// 使用中间件
app.use(signature(config));
app.use(accessToken(config));
// menu在有菜单项目修改的时候在进行启用，防止次数超过。
// app.use(menu(config));
app.use(xmlParser());
app.use(router.routes()).use(router.allowedMethods());

router.post('/', async (ctx, next) => {
    const xml = ctx.request.body;
    let result = await processingMsg(xml);
    ctx.body = result;
    await next();
})

app.on('error', (err, ctx) => {
    console.error('server error', err, ctx)
});

app.listen(3000, () => {
    console.log("The server is starting at port 3000");
});
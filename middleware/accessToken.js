const fs = require('fs');
let request = require('request');

function updateAccessToken(config) {
    let url = `${config.baseUrl}token?grant_type=client_credential&appid=${config.weChat.appID}&secret=${config.weChat.appsecret}`;
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if(error) throw error;
    
            let res = JSON.parse(body);
            let new_expires_in = new Date().getTime() + (res.expires_in - 20) * 1000;  //预留请求时间20s
            let txt = JSON.stringify({access_token: res.access_token, expires_in: new_expires_in})
            fs.writeFile(config.accessToken, txt, (err) => {
                if(err) throw err;
                console.log("save");
                resolve({access_token: res.access_token});
            })
        })
    })
}

module.exports = function(config) {
    return async function(ctx, next) {
        return new Promise((resolve, reject) => {
            fs.readFile(config.accessToken, 'utf8', async (err, data) => {
                if(err) throw err;
        
                if(data) {
                    let isExpires = JSON.parse(data).expires_in > Date.now() ? false : true;
                    if(!isExpires) {
                        // console.log("未过期，可以继续使用accessToken");
                        ctx.access_token = JSON.parse(data).access_token;
                    }
                    else {
                        let result = await updateAccessToken(config);
                        ctx.access_token = result.access_token;
                    }
                }
                else
                {
                    let result = await updateAccessToken(config);
                    ctx.access_token = result.access_token;
                }
                resolve();
            })
        }).
        then(async () => {
            await next();
        })
    }
}
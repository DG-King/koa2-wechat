let request = require('request');

function formatMessage(obj) {
    var message = {};
    if (typeof obj === "object") {
        var keys = Object.keys(obj);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var item = obj[key];
            if (!(item instanceof Array) || item.length === 0){
                continue;
            }
            if (item.length == 1) {
                var val = item[0];
                if(typeof val === "object") {
                    message[key] = formatMessage(val);
                }
                else{
                    message[key] = val || "";
                }
            }
            else{
                message[key] = [];
                for(var j = 0, k = item.length; j < k; j++){
                    message[key].push(formatMessage(item[j]));
                }
            }
        }
    }
    return message;
}

// 天气查询
function queryWeather(areaKey) {
    let area = '';
    if(areaKey === 'hj-weather') {
        area = '涵江'
    } else if (areaKey === 'pt-weather') {
        area = '莆田'
    } else if (areaKey === 'ly-weather') {
        area = '龙岩'
    };
    return new Promise((resolve, reject) => {
        let url = `https://free-api.heweather.net/s6/weather/forecast?location=${encodeURI(area)}&key=f919a6d1752c4fd2ab57d8cd5f580ade`;
        request(url, (err, response, body) => {
            if(err) throw err;
            
            let res = JSON.parse(body);
            if (res.HeWeather6[0].basic) {
                resolve(res.HeWeather6[0]);
            }
            else {
                reject();
            }
        })
    })
}

// 万年历
function queryCalendar() {
    return new Promise((resolve, reject) => {
        let option = {
            url : `https://www.sojson.com/open/api/lunar/json.shtml`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
            }
        }
        request(option, (err, response, body) => {
            if(err) throw err;
            
            let res = JSON.parse(body);
            if (res.status === 200) {
                resolve(res.data);
            }
            else {
                reject();
            }
        })
    })
}

// 智能机器人
function queryMachine(text) {
    return new Promise((resolve, reject) => {
        let option = {
            url : `http://api.qingyunke.com/api.php?key=free&appid=0&msg=${encodeURI(text)}`,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36'
            }
        }
        request(option, (err, response, body) => {
            if(err) throw err;
            
            let res = JSON.parse(body);
            if (res.result === 0) {
                let str = res.content.replace(/{br}/g, '\r\n');//todo 天气查询中会返回{br}
                resolve(str);
            }
            else {
                reject();
            }
        })
    })
}

function formatXml(msg, content) {
    const createTime = Date.now();
    let xml = `<xml>
                    <ToUserName><![CDATA[${msg.FromUserName}]]></ToUserName>
                    <FromUserName><![CDATA[${msg.ToUserName}]]></FromUserName>
                    <CreateTime>${createTime}</CreateTime>
                    <MsgType><![CDATA[text]]></MsgType>
                    <Content><![CDATA[${content}]]></Content>
                </xml>`;
    return xml;
}

module.exports = async function(xml) {
    let msg = formatMessage(xml.xml);
    const event = msg.Event ? msg.Event : '';
    let str = '';
	if(msg.MsgType === 'event' && event === 'subscribe') {
        let content = '你关注了牛逼的我，哈哈哈哈哈，有眼光！';
        str = formatXml(msg, content);
    } else if(msg.MsgType === 'event' && event === 'CLICK' && (~msg.EventKey.indexOf('weather'))) {
        let weather = await queryWeather(msg.EventKey);
        let weatherStr = '';
        weather.daily_forecast.map(item => {
            weatherStr += `${item.date} 白天天气: ${item.cond_txt_d} 晚间天气: ${item.cond_txt_n} 风力: ${item.wind_sc} \r\n `;
        })
        let weatherMsg = `${weather.basic.location}未来${weather.daily_forecast.length}天的天气是:\r\n ${weatherStr}`.trim();
        str = formatXml(msg, weatherMsg);
    } else if(msg.MsgType === 'event' && event === 'CLICK' && (msg.EventKey === 'calendar')) {
        let calendar = await queryCalendar();
        let calendarStr = `新历 : ${calendar.year}年${calendar.month}月${calendar.day}日\r\n农历 : ${calendar.hyear}年${calendar.cnmonth}月${calendar.cnday}\r\n宜 : ${calendar.suit}\r\n忌 : ${calendar.taboo}`;
        str = formatXml(msg, calendarStr);
    } else {
        let machine = await queryMachine(msg.Content || '');
        str = formatXml(msg, machine);
    }
    return str;
}
let menu = {
    "button":[
        {    
            "type":"click",
            "name":"万年历",
            "key":"calendar"
        },
        {
            "name":"菜单",
            "sub_button":[
                {    
                    "type":"view",
                    "name":"搜索",
                    "url":"http://www.soso.com/"
                },
                {
                    "type":"miniprogram",
                    "name":"wxa",
                    "url":"http://mp.weixin.qq.com",
                    "appid":"wx286b93c14bbf93aa",
                    "pagepath":"pages/lunar/index"
                },
                {
                    "type":"location_select",
                    "name":"获取地理位置",
                    "key":"V1001_GOOD"
                }
            ]
        },
        {
            "name": "天气", 
            "sub_button": [
                {
                    "type": "click", 
                    "name": "涵江天气", 
                    "key": "hj-weather"
                }, 
                {
                    "type": "click", 
                    "name": "莆田天气", 
                    "key": "pt-weather"
                }, 
                {
                    "type": "click", 
                    "name": "龙岩天气", 
                    "key": "ly-weather"
                }
            ]
        }
    ]
}

module.exports = menu;
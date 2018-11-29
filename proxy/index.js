/**
 * 代理服务器
 * edit by ferrinweb
 *
 * 请在项目目录使用 node proxy 指令启动
 * 代理接口默认为 3000，可以修改，但须同时修改项目请求端口
 */
let proxy = require('http-proxy-middleware')
let express = require('express')
let app = express()

// 跨域策略设置
app.all('*', function (req, res, next) {
  if (!req.get('Origin')) return next()
  // use "*" here to accept any origin
  // 允许所有请求跨域
  res.set('Access-Control-Allow-Origin', '*')
  // 允许所有请求方式（get/post/patch...）跨域
  res.set('Access-Control-Allow-Methods', '*')
  // 允许指定的请求头字段跨域
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, token, X-Appid, X-CurTime, X-CheckSum, X-Param')
  // res.set('Access-Control-Allow-Max-Age', 3600)
  // 预请求直接响应200
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

// 假设实际要访问接口: http://192.168.9.108:8081/mobie/login
// 请这样通过代理转发: http://locahost:3000/api/mobile/login

app.use('/asr', proxy({
  // 代理地址，带有 /api 前缀的请求路径转发至以下地址
  target: 'http://api.xfyun.cn/v1/service/v1/iat',
  changeOrigin: true,
  pathRewrite: {
    // 转发时去除 /api 前缀
    '^/asr': ''
  }
}))

app.listen(3000, function () {
  console.log('Proxy 正在售票，请在 3000 端口买票上船，马上渡河！')
})

# 讯飞语音听写 webApi 纯前端接口示例

> 讯飞云平台官方并没有web端api示例，最接近的可能是由 [Kenn Zhang](https://github.com/breakstring) 贡献的 [node.js 版本的示例](https://github.com/breakstring/xunfeisdk)。

> 讯飞不给出 web 客户端的示例有可能是没有打算这样做，因为目前讯飞语音听写等服务执行 IP 白名单策略。

> 与此相关的一个语音输入按钮（vue 组件）封装：[voice-input-button](https://github.com/ferrinweb/voice-input-button)

## 可能是讯飞语音相关服务接口的首个纯前端实现。

![](https://github.com/ferrinweb/voicedictation-webapi-demo/raw/master/screenshots.png)

## 检出并查看本示例
### 安装依赖
```
yarn install
```

### 配置应用ID及服务密钥

打开 /src/api/aer-config.js 填写你在讯飞云平台上创建的应用的ID及语音听写服务的密钥。
```
{
  engineType: 'sms16k', // 引擎类型, 默认即可
  aue: 'raw', // 音频编码，本实例取'raw'
  appId: '', // 应用ID
  APIKey: '', // 服务密钥
  sampleRate: 16000, // 采样率(48000)，注意：设定的值必须为 48000 的约数
  sampleBits: 16, // 采样比特率，8 或 16
  twoChannel: false // 双声道
}
```

### 启动代理
```
node proxy
```
代理端口为 3000

### 编译并启动
```
yarn run serve
```

## license
MIT License


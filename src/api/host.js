// 内网服务地址
const host = process.env.NODE_ENV === 'production' ? 'http://localhost:3000/' : ''
export default host

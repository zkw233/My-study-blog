// 业务调用接口层(登录,获取信息...)

import { resquest } from './request'

// 登录接口返回的 data 长什么样，在这里声明
export interface LoginData {
  token: string
  username: string
  nickname: string
}

// 把login来的数据json化,往api通用请求层传输,记得return 否则之前层的Promise对象将丢失
export function LoginApi(username: string, password: string) {
    // LoginData接口类型传给resquest，会继续匹配泛型
    // 填槽动作 LoginData类型上车
  return resquest<LoginData>('api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // 请求体 json字符化后传输键值对
    body: JSON.stringify({ username: username, password: password }),
  })
}

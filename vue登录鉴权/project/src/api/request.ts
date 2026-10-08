// 前端前端通用请求封装

// 后端统一返回JSON格式的类型约定（对应你 mock server 返回的结构）<T> 泛型接口

interface Apiresponse<T> {  // ← 前面的 <T>：声明"本接口有一个类型槽，名字叫 T" 
  code: number //状态码
  message: string //消息
  data: T // ← 后面的 T：把槽用在 data 这一栏上  //泛型数据 JSON详细业务数据 token,username,nickname...   LoginData接口类型会来到这里
}

const BASE_URL = 'http://localhost:3000/'

// 通用请求函数 url :api请求地址 option?:RequestInit :fetch第二个参数(可选),不写则保持浏览器默认值
// resquest<T> T接收来自auth调用时的LoginData接口类型（约束data内部）T属于类型形参，调用时确定类型
// resquest<T> T函数的槽 作用是接住调用方传来的类型，并转发给接口
async function resquest<T>(url: string, option?: RequestInit): Promise<Apiresponse<T>> {
  const res = await fetch(BASE_URL + url, option)
  const result = await res.json()

  // 请求失败
  if (!res.ok) {
    // 直接抛出Promise的rejected的对象,终止后续代码的执行 会被catch
    throw new Error(result.message || `请求失败${res.status}`) //res.status http响应码
  }

  // 返回Promise对象的result(JSON解析的内容)
  return result
}

// 导出
export type { Apiresponse }
export { resquest }

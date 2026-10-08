// =====================================================================
// 模拟后端服务器（给 vueLoginScience 登录页用的假接口）
// =====================================================================
//
// 【这是什么？】
//   一个用 Node.js 内置 http 模块写的"假后端"，零依赖、单文件。
//   它模拟了真实前后端协作里最核心的一件事：
//   前端发 HTTP 请求过来 -> 后端校验 -> 返回 JSON 数据
//
// 【怎么启动？】（在 vueLoginScience 目录下）
//   node mock/server.mjs
//   停止：终端按 Ctrl + C
//   （如果 3000 端口被占用，改最下面 server.listen(3000) 里的数字）
//
// 【测试账号】（写死在下面的 USERS 里，想改就改）
//   admin    / 123456
//   zhangsan / abc123
//
// 【提供的接口】
//   POST /api/login  登录，成功返回 token
//   GET  /api/me     带着 token 查询"我是谁"
// =====================================================================

import http from 'node:http'
import crypto from 'node:crypto'

// ---------------------------------------------------------------------
// 1. 用户数据（真实项目里这里应该是查数据库）
// ---------------------------------------------------------------------
const USERS = [
  { username: 'admin', password: '123456', nickname: '系统管理员' },
  { username: 'zhangsan', password: 'abc123', nickname: '张三' },
]

// ---------------------------------------------------------------------
// 2. token 记录表
// ---------------------------------------------------------------------
// token 可以理解为"通行证"：
//   登录时     -> 后端发一张 token 给前端
//   之后请求   -> 前端把 token 放在请求头里带过来
//   后端       -> 查这张表，就知道你是谁、有没有登录过
// 真实项目一般用 JWT 或 Redis 存会话，这里用内存 Map 演示原理足够了。
// 注意：服务重启后 Map 会清空，之前发的 token 全部失效。
const tokenMap = new Map() // token -> username

// ---------------------------------------------------------------------
// 3. 小工具
// ---------------------------------------------------------------------

// 模拟网络延迟：真实后端要查数据库、走网络，不会瞬间响应。
// 人为等 600 毫秒，方便前端观察"登录中..."的 loading 状态。
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// 生成一个随机不重复的字符串当 token（真实项目通常用 JWT）
const createToken = () => crypto.randomUUID()

// CORS 响应头（为什么需要它，见文件最底部的附注）
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// 统一用这个函数回 JSON：
//   statusCode：HTTP 状态码（200 成功 / 401 未授权 / 404 接口不存在）
//   data：要返回的 JS 对象，JSON.stringify 负责把它变成字符串
function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    ...CORS_HEADERS,
    'Content-Type': 'application/json; charset=utf-8',
  })
  res.end(JSON.stringify(data))
}

// ---------------------------------------------------------------------
// 4. 服务器主体：浏览器每发来一个请求，这个函数就执行一次
// ---------------------------------------------------------------------
const server = http.createServer(async (req, res) => {
  // ---- 处理 CORS 预检请求 ----
  // 浏览器发现是"跨域 + 带自定义请求头"的请求时，会先偷偷发一个
  // OPTIONS 请求，问后端"我能不能跨域访问你"。
  // 后端必须回"可以"，否则真正的请求根本发不出去。
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS) // 204 = 成功但没有内容
    res.end()
    return
  }

  // ---- 读取请求体 ----
  // POST 的参数不在 URL 上，而是放在"请求体"里，一小段一小段(chunk)
  // 传过来。先把所有 chunk 攒进数组，最后拼成完整字符串再 JSON.parse。
  const chunks = []
  for await (const chunk of req) {
    chunks.push(chunk)
  }
  let body = {}
  try {
    const raw = Buffer.concat(chunks).toString('utf-8')
    body = raw ? JSON.parse(raw) : {}
  } catch {
    return sendJSON(res, 400, { message: '请求体不是合法的 JSON' })
  }

  // ================= 接口一：POST /api/login 登录 =================
  if (req.method === 'POST' && req.url === '/api/login') {
    console.log(`[登录] 收到请求，用户名：${body.username || '(空)'}`)
    await delay(600)

    // 去写死的用户表里找（真实项目：SELECT * FROM users WHERE username=?）
    const user = USERS.find(
      (u) => u.username === body.username && u.password === body.password,
    )

    // 没找到：返回 401。故意不说"用户名错"还是"密码错"，
    // 防止坏人挨个试用户名（真实项目也这么处理）。
    if (!user) {
      console.log('[登录] 失败：用户名或密码错误')
      return sendJSON(res, 401, { message: '用户名或密码错误' })
    }

    // 找到了：发 token
    const token = createToken()
    tokenMap.set(token, user.username)
    console.log(`[登录] 成功：${user.nickname}（${user.username}）拿到 token`)
    return sendJSON(res, 200, {
      message: '登录成功',
      data: { token, username: user.username, nickname: user.nickname },
    })
  }

  // ================= 接口二：GET /api/me 我是谁 =================
  if (req.method === 'GET' && req.url === '/api/me') {
    // 前后端约定：token 放在 Authorization 请求头里，格式是 Bearer xxx
    const auth = req.headers['authorization'] || ''
    const token = auth.replace('Bearer ', '')

    const username = tokenMap.get(token)
    if (!username) {
      console.log('[查询] 失败：无效或过期的 token')
      return sendJSON(res, 401, { message: '未登录或登录已过期' })
    }

    const user = USERS.find((u) => u.username === username)
    console.log(`[查询] 成功：${user.nickname}`)
    return sendJSON(res, 200, {
      message: 'ok',
      data: { username: user.username, nickname: user.nickname },
    })
  }

  // 其他任何路径：404
  console.log(`[404] ${req.method} ${req.url}`)
  sendJSON(res, 404, { message: '接口不存在' })
})

// ---------------------------------------------------------------------
// 5. 启动监听
// ---------------------------------------------------------------------
// 前端跑在 5178（Vite），后端跑在 3000 —— 两个独立进程、两个端口，
// 这正是"前后端分离"的样子。
server.listen(3000, () => {
  console.log('==============================================')
  console.log(' 模拟后端已启动：http://localhost:3000')
  console.log('----------------------------------------------')
  console.log(' 测试账号（写死在 mock/server.mjs 顶部）：')
  USERS.forEach((u) =>
    console.log(`   用户名：${u.username}  密码：${u.password}`),
  )
  console.log('----------------------------------------------')
  console.log(' 接口：POST /api/login   登录')
  console.log('       GET  /api/me      查询当前用户')
  console.log('==============================================')
})

// =====================================================================
// 【附：为什么需要 CORS 那几行？】
// 浏览器有"同源策略"：页面(localhost:5178)去请求另一个端口
// (localhost:3000)，端口不同就算"跨域"，浏览器会先把请求拦下来，
// 除非后端在响应里明确加上 Access-Control-Allow-* 这些响应头表示允许。
// 所以后端必须写这几行，否则前端控制台会出现著名的 CORS 报错。
// 另一种解决办法是"Vite 代理"（让请求看起来同源），详见对话里的说明。
// =====================================================================

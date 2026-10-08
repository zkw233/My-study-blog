<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLoginDataStore } from '@/stores/auth'
const username = ref('')
const password = ref('')
const loading = ref(false)
const errMsg = ref('')
const router = useRouter()
const remember = ref(true)

async function handleLogin() {
  // 阻止重复表单提交
  if (loading.value) return
  // 阻止空账户
  if (!username.value.trim()) {
    errMsg.value = '账号不能为空'
    return
  }
  // 阻止空密码
  if (!password.value) {
    errMsg.value = '密码不能为空'
    return
  }
  // 允许提交表单
  loading.value = true

  try {
    // res 是响应对象，不是后端返回的数据，res.ok:布尔值，判断是否请求成功，404/500需要手动判断res.ok
    // res.json()解析后端接口传来的json文件
    // fetch浏览器原生请求api接口
    // fetch(api路径，{请求方法，请求头，请求体})
    // 调用store的参数与方法
    const result = useLoginDataStore()
    await result.loginStore(username.value,password.value,remember.value)
      // alert(`登录成功，欢迎回来${result.data.nickname} ~ `)
      router.push('/home')
      // 清空密码
      password.value = ''
      errMsg.value = ''
    } catch(e) {
    errMsg.value = e instanceof Error ? e.message:"出错了"
  
  } finally {
    loading.value = false
  } //关闭表单提交
}

function cancel() {
  username.value = ''
  password.value = ''
  errMsg.value = ''
}

function forget(){
  errMsg.value = "没这个功能，摆设(没完工)"
}


</script>

<template>
  <main class="card">
    <header class="brand">
      <h1>智能业务管理平台</h1>
      <div class="en">INTELLIGENT PLATFORM</div>
    </header>
    <!-- 阻止表单自动刷新且调用函数 -->
    <form id="loginForm" @submit.prevent="handleLogin">
      <div class="field">
        <label for="username">用户名 / USERNAME</label>
        <input
          v-model="username"
          id="username"
          type="text"
          placeholder="请输入用户名"
          autocomplete="username"
        />
      </div>

      <div class="field pwd-wrap">
        <label for="password">密码 / PASSWORD</label>
        <input
          v-model="password"
          id="password"
          type="password"
          placeholder="请输入密码"
          autocomplete="current-password"
        />
        <button @click="forget" type="button" class="eye-btn" id="eyeBtn">显示</button>
      </div>

      <div class="err" id="errMsg">{{ errMsg }}</div>

      <div class="row">
        <label class="remember">
          <input v-model="remember" type="checkbox" id="remember" checked />
          <span>记住登录状态</span>
        </label>
        <a href="#" @click="forget" class="forgot" id="forgot">忘记密码？</a>
      </div>

      <div class="btns">
        <button @click="cancel" type="button" class="btn ghost" id="cancelBtn">取 消</button>
        <button type="submit" class="btn primary" id="loginBtn">登 录</button>
      </div>
    </form>

    <footer class="foot">
      <span>安全连接已建立</span>
      <span>v2.0.4</span>
    </footer>
  </main>
</template>

<style scoped>
/* ===== 说明 =====
         scoped 只会给本组件模板内的元素加 data-v 属性。
         body / html / #app / * 这些「组件外」的元素这里写了也不会生效
         （会被编译成 body[data-v-xxx] 这种匹配不到的选择器）。
         它们已统一移到 src/styles/global.css，由 main.ts 全局引入。
         本文件只保留卡片自身及其内部元素的样式。 */

/* ===== 登录卡片 ===== */
/* 父级 #app 已设为 flex 居中，这里只要保证宽度和最大宽度即可,
         不要再依赖 body 的居中（scoped 下 body 选择器无效） */
.card {
  width: 100%;
  max-width: 420px;
  background: rgba(10, 18, 30, 0.92); /* 半透深色底 */
  border: 1px solid #1e3a5f;
  border-radius: 16px;
  /* 上36 左右(复用)28 下24 */
  padding: 36px 28px 24px;
  /* 水平偏移0 垂直向下20 模糊半径 颜色 */
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}

/* ===== 标题区 ===== */
.brand {
  text-align: center;
  margin-bottom: 28px;
}
.brand h1 {
  font-size: 26px;
  font-weight: 700;
  /* 字符之间的间距 */
  letter-spacing: 2px;
  color: #2fd8ff;
}
.brand .en {
  margin-top: 6px;
  font-size: 12px;
  /* 字符之间的间距 */
  letter-spacing: 4px;
  color: #7f95ab;
}

/* ===== 输入框 ===== */
.field {
  background: #0e1c2e;
  border: 1px solid #1d3a58;
  border-radius: 12px;
  padding: 12px 14px;
  margin-bottom: 16px;
  /* 边框颜色过渡平滑时长 */
  transition: border-color 0.2s;
}
/* field框聚焦时变色 */
.field:focus-within {
  border-color: #2fd8ff;
}
.field label {
  display: block;
  font-size: 12px;
  color: #63d0f0;
  margin-bottom: 4px;
}
.field input {
  width: 100%;
  /* 完全透明，凸显父级元素的颜色 */
  background: transparent;
  border: 0;
  outline: 0;
  color: #eaf6ff;
  font-size: 16px;
}
/* 表单输入框的默认值字体颜色 */
.field input::placeholder {
  color: #41586e;
}

/* ===== 密码行 ===== */
.pwd-wrap {
  /* 父元素相对定位 */
  position: relative;
}
.pwd-wrap input {
  padding-right: 38px;
}
.eye-btn {
  /* 脱离文档流 */
  /* 父相子绝，实现子元素在父元素内部精确位置的移动，类似于头像的右上角小红点 */
  position: absolute;
  right: 10px;
  top: 50%;
  /* 向上偏移元素自身高度的50% */
  transform: translateY(-50%);
  background: none;
  border: 0;
  color: #7e97ad;
  cursor: pointer;
}

/* ===== 选项行 ===== */
.row {
  display: flex;
  /* 主轴子元素均匀分布 */
  justify-content: space-between;
  align-items: center;
  margin: 18px 0 22px;
  font-size: 14px;
}
.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  /* 鼠标变手型 */
  cursor: pointer;
}
.remember input {
  width: 16px;
  height: 16px;
  /* 选中后颜色 */
  accent-color: #2fd8ff;
}
.forgot {
  color: #7f95ab;
  text-decoration: none;
}
.forgot:hover {
  color: #2fd8ff;
}

/* ===== 按钮 ===== */
.btns {
  display: flex;
  gap: 12px;
}
.btn {
  flex: 1;
  height: 46px;
  border-radius: 10px;
  font-size: 16px;
  border: 0;
  cursor: pointer;
  transition: opacity 0.2s;
}
.btn:hover {
  opacity: 0.9;
}
.btn.primary {
  background: #2fd8ff;
  color: #041220;
  font-weight: 600;
}
.btn.ghost {
  background: #132638;
  color: #dbe9f5;
  border: 1px solid #1d3a58;
}

/* ===== 错误提示 ===== */
.err {
  color: #ff5f6d;
  font-size: 13px;
  margin: -8px 0 12px;
  /* display: none; */
}

/* ===== 底部状态 ===== */
.foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 22px;
  padding-top: 16px;
  border-top: 1px solid #122640;
  font-size: 12px;
  color: #5d7893;
}

/* ===== 移动端适配 ===== */
@media (max-width: 480px) {
  .card {
    padding: 28px 20px 20px;
  }
  .brand h1 {
    font-size: 22px;
  }
}
</style>

<template>
  <!-- 整体使用单独的class设置flex，减少内部组件受到#app的影响 -->
  <div class="home">
    <h1>登录成功，欢迎回来</h1>
    <h2> {{ result.username }}~</h2>
    <div class="btns">
      <button class="btn cancel" @click="logout">退出登录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLoginDataStore } from '@/stores/auth'
import { ref } from 'vue'
const router = useRouter()

// 统一调用store
const result = useLoginDataStore()
function logout() {
  
  // localStorage.removeItem('token') // 功能迭代 已废弃
  
  result.logout()
  // 编程式跳转
  router.push('/login')
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* h1和按钮的空间 */
  gap: 12px;
  width: 100%;
  max-width: 360px;
}

.btns {
  display: flex;
  /* align-items: center;
   justify-content: center; */
  width: 100%;
  max-width: 120px;
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

.btn.cancel {
  background: #132638;
  color: #dbe9f5;
  border: 1px solid #1d3a58;
}

.btn:hover {
  opacity: 0.9;
}
</style>

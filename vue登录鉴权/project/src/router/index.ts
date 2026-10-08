import { createRouter, createWebHistory } from 'vue-router'
import { useLoginDataStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/components/Login.vue'),
      meta: { reqLogin: false, title: '登录' },
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('@/components/Home.vue'),
      meta: { reqLogin: true, title: '首页' },
    },
    { path: '/', redirect: 'login' },
  ],
})
// 路由守卫
router.beforeEach((to) => {
  // 统一从store获取(注意需要放在路由守卫回调函数内)
  const result = useLoginDataStore()
  

  // 载入需要登录的界面且没有用户token，踢回登录页
  if (to.meta.reqLogin && !result.token) {
    // 强行跳到登录，附带查询（保存原目标），登录成功后自动跳
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // 已登录用户（有token）误进入登录页，返回首页，而不是登录页
  if (to.path === '/login' &&result.token) {
    return { path: '/home' }
  }

  // 其他情况
  return true
})


  router.afterEach((to) => {
    document.title = to.meta.title ?? "项目系统"
  })


export default router

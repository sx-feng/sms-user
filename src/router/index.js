import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/userstore'

// 页面组件

import DashBoard from '@/pages/DashBoard.vue'
import LoginPage from '@/pages/LoginPage.vue'

// 路由配置
const routes = [
  {
    path: '/login',
    name: 'loginpage',
    component: LoginPage,
    meta: { title: '用户登录', requiresAuth: false }
  },
  {
    path: '/',
    name: 'dashboard',
    component: DashBoard,
    meta: { title: '控制台', requiresAuth: true }
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局前置守卫（登录验证）
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token || localStorage.getItem('token')

  // 设置网页标题
  if (to.meta.title) {
    document.title = `${to.meta.title} - wzz用户端`
  }

  // 需要登录的页面
  if (to.meta.requiresAuth && !token) {
    next({ name: 'login' })
  } 
  // 已登录访问登录页 → 自动跳转 Dashboard
  else if (to.name === 'login' && token) {
    next({ name: 'dashboard' })
  } 
  else {
    next()
  }
})

export default router

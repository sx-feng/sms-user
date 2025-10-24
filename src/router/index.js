import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/userstore'

import DashBoard from '@/pages/DashBoard.vue'
import LoginPage from '@/pages/LoginPage.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
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

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  const token = userStore.token || localStorage.getItem('token')
  const loggedIn = !!(token || userStore.userInfo)

  if (to.meta.title) {
    document.title = `${to.meta.title} - wzz用户端`
  }

  if (to.meta.requiresAuth && !loggedIn) {
    next({ name: 'login' })
  } else if (to.name === 'login' && loggedIn) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router

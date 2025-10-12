import { defineStore } from 'pinia'

export const useUserStore = defineStore('userStore', {
  state: () => ({
    userInfo: null,   // 用户详细信息
    token: null       // 登录令牌
  }),

  actions: {
    /**
     * 设置用户信息与 token
     * @param {Object} data 后端返回的用户信息
     */
    setUserInfo(data) {
      this.userInfo = data
      this.token = data?.token || ''
      localStorage.setItem('token', this.token)
      localStorage.setItem('userInfo', JSON.stringify(data))
    },

    /**
     * 从本地缓存加载用户信息（防止刷新丢失）
     */
    loadUserFromCache() {
      const token = localStorage.getItem('token')
      const info = localStorage.getItem('userInfo')
      if (token) this.token = token
      if (info) this.userInfo = JSON.parse(info)
    },

    /**
     * 清空登录状态（退出登录）
     */
    logout() {
      this.userInfo = null
      this.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
    }
  }
})

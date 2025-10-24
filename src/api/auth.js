import { request } from './request.js'
import { useUserStore } from '@/store/userstore'

function getAuth() {
  const store = useUserStore()
  return {
    userName: store.userName || localStorage.getItem('u') || '',
    password: store.password || localStorage.getItem('p') || ''
  }
}

/**
 * 自动带用户名/密码的请求
 * @param {number} methodFlag  0 GET 1 POST
 * @param {string} url         接口路径
 * @param {object} bizData     业务参数（不含 auth）
 * @param {boolean} isQuery    是否 query 模式
 */
export function authRequest(methodFlag, url, bizData = {}, isQuery = false) {
  const auth = getAuth()
  const payload = { ...bizData, ...auth }
  return request(methodFlag, url, payload, isQuery)
}
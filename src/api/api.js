/* ====== 用户 + 代理层接口（支持表单/Store 两种来源）====== */
import { request } from '@/utils/request'
import { useUserStore } from '@/store/userstore'
import dayjs from 'dayjs'

function withAuth(biz = {}) {
  const store = useUserStore()
  return {
    userName: store.userName || localStorage.getItem('u') || '',
    password: store.password || localStorage.getItem('p') || '',
    ...biz,
  }
}

// 从参数或 Store 组装账号信息
function authParams(userName, password, extra = {}) {
  if (typeof userName === 'string') {
    return { userName, password: password ?? '', ...extra }
  }
  return withAuth(extra)
}

/* ---------- 用户层 ---------- */
export const getUserInfo = (userName, password) =>
  request(0, '/api/user/info', authParams(userName, password), true)

export const getBalance = (userName, password) =>
  request(0, '/api/user/getBalance', authParams(userName, password), true)
export const getUserBalance = getBalance

export const getNumber = (a, b, c, d) => {
  // 形态1：getNumber(userName, password, projectId, lineId)
  if (typeof a === 'string') {
    const userName = a
    const password = b
    const projectId = c
    const lineId = d
    return request(0, '/api/user/getNumber', authParams(userName, password, { projectId, lineId }), true)
  }
  // 形态2：getNumber(projectId, lineId)
  const projectId = a
  const lineId = b
  return request(0, '/api/user/getNumber', withAuth({ projectId, lineId }), true)
}

export const getCode = (userNameOrPhone, passwordMaybe, phoneMaybe) => {
  // 形态1：getCode(userName, password, phoneNumber)
  if (typeof userNameOrPhone === 'string' && typeof passwordMaybe === 'string' && typeof phoneMaybe === 'string') {
    return request(0, '/api/user/getCode', authParams(userNameOrPhone, passwordMaybe, { phoneNumber: phoneMaybe }), true)
  }
  // 形态2：getCode(phoneNumber)
  const phoneNumber = userNameOrPhone
  return request(0, '/api/user/getCode', withAuth({ phoneNumber }), true)
}

export const listNumbers = (status, startTime, endTime, page = 1, size = 10) =>
  request(0, '/api/user/listNumbers', withAuth({
    status,
    startTime: startTime ? dayjs(startTime).format('YYYY-MM-DD HH:mm:ss') : '',
    endTime: endTime ? dayjs(endTime).format('YYYY-MM-DD HH:mm:ss') : '',
    page,
    size,
  }), true)

export const updatePassword = (oldPassword, newPassword) =>
  request(1, '/api/user/update/passward', withAuth({ oldPassword, newPassword }), true)

export const getNotice = () => request(0, '/api/user/notice', {}, true)

export const listUserProjects = () =>
  request(0, '/api/user/by-user/listProjects', withAuth(), true)

export const listProjectLines = (projectId) =>
  request(0, '/api/user/listProjectLines', withAuth({ projectId }), true)

/* ---------- 代理层 ---------- */
export const viewAgentUserLedger = (params) =>
  request(0, '/api/agent/subordinate-ledgers', params, true)

export const getAgentDashboard = () =>
  request(0, '/api/agent/dashboard-stats', {}, true)

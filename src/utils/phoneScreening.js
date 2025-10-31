import { authRequest } from '@/api/auth'

export const SCREENING_APPS = [
  { label: '抖音', value: 'dy' },
  { label: '小红书', value: 'xhs' },
  { label: '快手', value: 'ks' },
  { label: '西瓜', value: 'xg' },
  { label: '头条', value: 'tt' },
  { label: '美团', value: 'mt' },
  { label: '微博', value: 'wb' },
  { label: '苏宁', value: 'suning' },
  { label: '百度', value: 'baidu' },
  { label: '陌陌', value: 'momo' },
  { label: '京东', value: 'jd' },
  { label: '哔哩', value: 'bili' },
]

export const SCREENING_STATE_OPTIONS = [
  { label: '新号', value: 'new' },
  { label: '老号', value: 'old' },
  { label: '新老', value: 'both' },
]

const DEFAULT_TIMEOUT = 60000

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

function withTimeout(promise, timeout = DEFAULT_TIMEOUT) {
  if (!timeout || timeout <= 0) return promise
  let timeoutId
  const timePromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('请求超时'))
    }, timeout)
  })

  return Promise.race([
    promise.finally(() => clearTimeout(timeoutId)),
    timePromise,
  ])
}

export async function checkPhoneNumberState({ phone, token, cpid, cnty, timeout = DEFAULT_TIMEOUT } = {}) {
  if (!phone) {
    throw new Error('缺少手机号')
  }
  if (!token) {
    throw new Error('缺少筛选卡密')
  }
  if (!cpid) {
    throw new Error('缺少筛选项目')
  }

  const payload = { phone, token, cpid }
  if (cnty) {
    payload.cnty = cnty
  }

  const response = await withTimeout(
    authRequest(1, '/api/user/checkPhoneNumberState', payload),
    timeout,
  )

  const status = response?.raw?.status ?? response?.code ?? null
  const msg = response?.raw?.msg ?? response?.message ?? ''
  const label = typeof response?.data === 'string' ? response.data.trim() : ''

  return {
    status,
    ok: status === 0,
    label,
    message: msg,
    raw: response,
  }
}

export async function retryCheckPhoneNumberState(params, { retries = 3, retryDelay = 1000 } = {}) {
  let lastError = null

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await checkPhoneNumberState(params)

      if (result.label === '检测失败' && attempt < retries) {
        await delay(retryDelay)
        continue
      }

      return { ...result, attempt }
    } catch (error) {
      lastError = error
      if (attempt < retries) {
        await delay(retryDelay)
        continue
      }
      throw error
    }
  }

  return { ...lastError, attempt: retries }
}

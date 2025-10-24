import { request } from "@/utils/request";

// 从 localStorage 获取用户名和密码
function getAuthFromStore() {
  const userName = localStorage.getItem('u') || '';
  const password = localStorage.getItem('p') || '';
  if (!userName || !password) {
    throw new Error('用户名或密码未设置');
  }
  return { userName, password };
}

/**
 * 自动带用户名/密码的请求
 * @param {0|1} methodFlag 0=GET 1=POST
 * @param {string} url 请求的 URL
 * @param {object} bizData 业务参数（可包含 userName/password 覆盖）
 * @param {boolean} isQuery GET/POST 的 query 模式
 */
export function authRequest(methodFlag, url, bizData = {}, isQuery = false) {
  let payload = { ...(bizData || {}) };

  // 优先使用传入的 userName/password，其次回退到本地存储
  const hasInlineAuth = payload.userName && payload.password;
  if (!hasInlineAuth) {
    const auth = getAuthFromStore();
    payload = { ...payload, ...auth };
  }

  // 发送请求
  return request(methodFlag, url, payload, isQuery);
}

// 兼容旧调用名
export { authRequest as auth };

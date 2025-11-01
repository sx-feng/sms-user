<template>
  <div class="login-page">
    <div class="login-card">
      <img src="@/assets/logo.jpg" alt="logo" class="logo" />
      <h2 class="title">汇科登录</h2>

      <el-form :model="form" :rules="rules" ref="loginForm" label-position="top">
        <el-form-item label="用户ID" prop="userName">
          <el-input v-model="form.userName" placeholder="请输入用户ID" clearable />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="form.password"
            placeholder="请输入密码"
            show-password
            clearable
          />
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            class="login-btn"
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="footer">
        <span>© 2025 汇科 版权所有</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/userstore'
import { getUserInfo } from '@/api/api.js'

const router = useRouter()
const userStore = useUserStore()
const loginForm = ref()
const loading = ref(false)

const form = ref({
  userName: '',
  password: ''
})

const rules = {
  userName: [{ required: true, message: '请输入用户ID', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = () => {
  loginForm.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true

    try {
      const userName = form.value.userName
      const password = form.value.password
      const res = await getUserInfo(userName, password)
      const success = res.code === 0 || res.data?.status === 0

      if (!success) {
        ElMessage.error(res.message || '登录失败')
        return
      }

      const payload = res.data || {}
      const token = payload.token || res.raw?.token || ''
      if (token) {
        localStorage.setItem('token', token)
      }

      userStore.setUserInfo(payload, userName)
      localStorage.setItem('u', userName)
      localStorage.setItem('p', password)

      ElMessage.success('登录成功')
      router.push('/dashboard')
    } catch (e) {
      ElMessage.error('请求异常，请检查网络')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped lang="scss">
.login-page {
  width: 100%;
  height: 100vh;
  background: #f7f8fa;
  display: flex;
  justify-content: center;
  align-items: center;

  .login-card {
    width: 380px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
    padding: 40px 30px;
    text-align: center;

    .logo {
      width: 100px;
      margin-bottom: 20px;
    }

    .title {
      font-size: 18px;
      margin-bottom: 30px;
      color: #333;
      font-weight: 600;
    }

    .el-form {
      text-align: left;

      .el-input {
        height: 38px;
      }
    }

    .login-btn {
      width: 100%;
      height: 40px;
      border-radius: 8px;
      font-size: 15px;
    }

    .footer {
      font-size: 12px;
      color: #999;
      margin-top: 20px;
    }
  }
}
</style>

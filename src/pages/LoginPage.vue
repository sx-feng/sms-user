

<template>
  <div class="login-page">
    <div class="login-card">
      <img src="@/assets/logo.png" alt="logo" class="logo" />

      <h2 class="title">手机号验证码平台登录</h2>
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
        <span>© 2024 手机号与验证码获取平台. 保留所有权利.</span>
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
      const res = await getUserInfo(
        form.value.userName,
        form.value.password
      )

      if (res.data.status === 0) {
        ElMessage.success('登录成功')

        // 直接使用用户输入的用户名，而不是后端返回的
        const userName = form.value.userName // 使用前端输入的用户名
        const password = form.value.password

        // 设置 userStore 和 localStorage
        userStore.setUserInfo(res.data, userName, password) // 将 userName 和 password 存入 store
        localStorage.setItem('u', userName) // 存用户名
        localStorage.setItem('p', password) // 存密码

        console.log('Username:', userName)
        console.log('Password:', password)
        console.log('u:', userStore.userName, 'p:', userStore.password, 'token:', userStore.token)

        // 跳转到仪表盘
        router.push('/dashboard')

      } else {
        ElMessage.error(res.message || '登录失败')
      }
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

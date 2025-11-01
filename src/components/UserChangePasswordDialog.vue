<template>
  <el-dialog
    v-model="visible"
    title="🔐 修改密码"
    width="420px"
    :close-on-click-modal="false"
  >
    <el-form
      :model="form"
      ref="formRef"
      label-width="90px"
      :rules="rules"
      size="small"
    >
      <el-form-item label="用户名" prop="userName">
        <el-input
          v-model="form.userName"
          placeholder="请输入用户名"
          
        />
      </el-form-item>

      <el-form-item label="旧密码" prop="oldPassword">
        <el-input
          v-model="form.oldPassword"
          type="password"
          placeholder="请输入旧密码"
          show-password
        />
      </el-form-item>

      <el-form-item label="新密码" prop="newPassword">
        <el-input
          v-model="form.newPassword"
          type="password"
          placeholder="请输入新密码，密码长度需在6~20位之间"
          show-password
        />
      </el-form-item>

      <el-form-item label="确认新密码" prop="confirmPassword">
        <el-input
          v-model="form.confirmPassword"
          type="password"
          placeholder="请再次输入新密码"
          show-password
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="closeDialog">取消</el-button>
      <el-button type="primary" :loading="loading" @click="submitChange">
        确认修改
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { updateUserPassword} from '@/api/api'

// 接收外部控制弹窗开关
const props = defineProps({
  modelValue: { type: Boolean, required: true }
})
const emit = defineEmits(['update:modelValue', 'success'])

const visible = ref(props.modelValue)
watch(() => props.modelValue, (val) => (visible.value = val))
watch(visible, (val) => emit('update:modelValue', val))

const formRef = ref(null)
const loading = ref(false)
const form = ref({
  userName: '',
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 校验规则
const rules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {
      min: 6,
      max: 20,
      message: '密码长度需在6~20位之间',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        if (value !== form.value.newPassword) {
          callback(new Error('两次新密码输入不一致'))
        } else callback()
      },
      trigger: 'blur'
    }
  ]
}

// 初始化时自动带出用户名
onMounted(() => {
  form.value.userName =
    localStorage.getItem('userName') ||
    localStorage.getItem('user') ||
    ''
})

// 关闭弹窗
const closeDialog = () => {
  visible.value = false
  form.value.oldPassword = ''
  form.value.newPassword = ''
  form.value.confirmPassword = ''
}

// 提交修改密码
const submitChange = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const res = await updateUserPassword({
        userName: form.value.userName,
        oldPassword: form.value.oldPassword,
        newPassword: form.value.newPassword
      })

      if (res.code === 200) {
        ElMessageBox.alert('密码修改成功，请重新登录！', '提示', {
          confirmButtonText: '确定',
          type: 'success',
          callback: () => {
            emit('success') // 通知父组件退出登录
            closeDialog()
          }
        })
      } else {
        ElMessage.error(res.message || '修改失败')
      }
    } catch (err) {
      console.error('修改密码异常：', err)
      ElMessage.error('网络异常，修改失败')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.el-dialog__body {
  padding-top: 10px;
}
</style>
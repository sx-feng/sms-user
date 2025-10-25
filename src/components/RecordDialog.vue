<template>
  <el-dialog v-model="dialogVisible" title="流水记录" width="800px">
    <div class="filter-bar">
      <!-- 日期筛选 -->
      
      <el-button type="primary" @click="fetchList">查询</el-button>
      <el-button @click="resetFilters">重置</el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="list" border stripe v-loading="loading">
      <el-table-column prop="id" label="ID" width="100" />
      <el-table-column prop="lineId" label="线路ID" width="100" />
      <el-table-column prop="phoneNumber" label="手机号" min-width="140" />
      <el-table-column prop="code" label="验证码" min-width="120" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag v-if="row.status === '成功'" type="success">成功</el-tag>
          <el-tag v-else-if="row.status === '等待中'" type="warning">等待中</el-tag>
          <el-tag v-else type="danger">失败</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="timestamp" label="时间" min-width="160" />
      <el-table-column prop="remark" label="类型" min-width="160" />
    </el-table>

    <!-- 分页 -->
    <el-pagination
      background
      layout="prev, pager, next"
      :total="total"
      :page-size="pageSize"
      :current-page="page"
      @current-change="onPageChange"
    />
    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { viewAgentUserLedger } from '@/api/api'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const status = ref('')
const dateRange = ref([])
const list = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const loading = ref(false)

const parseListResponse = (res) => {
  const data = res?.data
  if (Array.isArray(data)) {
    return { items: data, total: data.length }
  }
  if (data && Array.isArray(data.list)) {
    return { items: data.list, total: data.total ?? data.count ?? data.list.length }
  }
  return { items: [], total: 0 }
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await viewAgentUserLedger(page.value, pageSize.value)
    console.log("接口响应:", res)  
    if (res?.ok || res?.code === 0) {
     
      list.value =  res.data.records
      total.value = res.data.total || 0
    } else {
      list.value = []
      total.value = 0
    }
  } finally {
    loading.value = false
  }
}


const onPageChange = (p) => {
  page.value = p
  fetchList()
}

const resetFilters = () => {
  status.value = ''
  dateRange.value = []
  page.value = 1
  fetchList()
}

watch(dialogVisible, (v) => {
  if (v) {
    page.value = 1
    fetchList()
  }
})
</script>

<style scoped>
.filter-bar { display: flex; gap: 10px; align-items: center; margin-bottom: 10px; }
.w-140 { width: 140px; }
.pagination { margin-top: 12px; text-align: right; }
</style>

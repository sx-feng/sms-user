<template>
  <el-dialog v-model="dialogVisible" title="流水记录" width="800px">
    <div class="filter-bar">
     
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD HH:mm:ss"
      />
      <el-button type="primary" @click="fetchList">查询</el-button>
      <el-button @click="resetFilters">重置</el-button>
    </div>

    <el-table :data="list" border stripe v-loading="loading">
      <el-table-column prop="projectId" label="项目ID" width="100" />
      <el-table-column prop="lineId" label="线路ID" width="100" />
      <el-table-column prop="phoneNumber" label="手机号" min-width="140" />
      <el-table-column prop="code" label="验证码" min-width="120" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="createdAt" label="时间" min-width="160" />
    </el-table>

    <div class="pagination">
      <el-pagination
        background
        layout="prev, pager, next"
        :total="total"
        :page-size="pageSize"
        :current-page="page"
        @current-change="onPageChange"
      />
    </div>

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
  // 兼容多种返回结构
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
   // 将时间转换为合适的格式
const startTime = new Date('2025-10-01 00:00:00').toISOString() // "2025-10-01T00:00:00.000Z"
const endTime = new Date('2025-11-05 00:00:00').toISOString() // "2025-11-05T00:00:00.000Z"
    const res = await viewAgentUserLedger(startTime,endTime, page.value, pageSize.value)
    if (res?.ok || res?.code === 200) {
      const { items, total: t } = parseListResponse(res)
      list.value = items
      total.value = t
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

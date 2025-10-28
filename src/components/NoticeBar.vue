<template>
  <div class="notice-bar" v-if="notices.length">
    <el-icon><BellFilled /></el-icon>

    <!-- 公告内容滚动区 -->
    <div class="notice-scroll">
      <div
        v-for="(item, index) in notices"
        :key="index"
        class="notice-item"
        v-html="item.content"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { BellFilled } from '@element-plus/icons-vue'
import { getNotice } from '@/api/api.js'

const notices = ref([])

async function loadNotices() {
  try {
    const res = await getNotice()
    console.log('公告接口响应', res)

    if (!res.ok) {
      console.warn('加载公告失败:', res.message)
      return
    }

    const d = res.data

    if (typeof d === 'string') {
      notices.value = [{ title: '系统公告', content: d }]
    } else if (Array.isArray(d)) {
      notices.value = d.map(it => ({
        title: it.title ?? it.noticeTitle ?? it.name ?? '公告',
        content: it.content ?? it.noticeContent ?? it.desc ?? ''
      }))
    } else if (d && typeof d === 'object') {
      const list = d.records || d.list || d.rows || []
      notices.value = list.map(it => ({
        title: it.title ?? it.noticeTitle ?? it.name ?? '公告',
        content: it.content ?? it.noticeContent ?? it.desc ?? ''
      }))
    } else {
      console.warn('公告格式无法识别:', d)
    }

    await nextTick()
    startScroll()
  } catch (e) {
    console.warn('公告接口异常', e)
  }
}

// 🌟 滚动动画逻辑
function startScroll() {
  const box = document.querySelector('.notice-scroll')
  if (!box) return
  box.scrollTop = 0

  const totalHeight = box.scrollHeight
  const step = 1
  const delay = 30 // 每30ms移动1px
  let current = 0

  function scroll() {
    current += step
    if (current >= totalHeight - box.clientHeight) {
      current = 0 // 循环滚动
    }
    box.scrollTop = current
  }

  clearInterval(box._scrollTimer)
  box._scrollTimer = setInterval(scroll, delay)
}

onMounted(loadNotices)
</script>

<style scoped>
.notice-bar {
  display: flex;
  align-items: flex-start;
  background-color: #fffbe6;
  border: 1px solid #ffecb3;
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  color: #333;
  gap: 8px;
}

.notice-scroll {
  flex: 1;
  height: 60px; /* 可自行调整公告区高度 */
  overflow: hidden;
  position: relative;
  line-height: 1.6;
  padding-right: 10px;
}

.notice-item {
  padding: 4px 0;
  color: #333;
  white-space: pre-line;
}

.notice-item:hover {
  color: #e6a23c;
}
</style>

<template>
  <div style="padding: 20px">
    <h2>货架 {{ shelfNo }}</h2>
    <el-button @click="goBack" type="primary" style="margin-bottom: 20px">返回货架列表</el-button>

    <el-row :gutter="20">
      <el-col :span="8" v-for="area in ['left', 'center', 'right']" :key="area">
        <el-card @click="goToArea(area)" style="cursor: pointer">
          <h3>{{ areaLabel(area) }}</h3>
          <p>{{ shelfData.areas[area]?.length > 0 ? '有货' : '无货' }}</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getShelfByNo } from '../useShelfDB'

const route = useRoute()
const router = useRouter()
const shelfNo = route.params.shelfNo
const shelfData = ref({
  areas: {
    left: [],
    center: [],
    right: []
  }
})

const areaLabel = (area) => {
  return {
    left: '左侧区域',
    center: '中间区域',
    right: '右侧区域'
  }[area]
}

const goBack = () => {
  router.push('/')
}

const goToArea = (area) => {
  router.push(`/shelf/${shelfNo}/${area}`)
}

onMounted(async () => {
  const data = await getShelfByNo(shelfNo)
  if (data) shelfData.value = data
})
</script>

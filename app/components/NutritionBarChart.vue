<template>
  <div style="height: 320px; position: relative;">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>

<script lang="ts" setup>
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

type DayReport = {
  date: string
  proteins: number
  fats: number
  carbs: number
  calories: number
  cost: number
}

const props = defineProps<{ rows: DayReport[] }>()

function fmtDate(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${d}.${m}`
}

const chartData = computed(() => ({
  labels: props.rows.map(r => fmtDate(r.date)),
  datasets: [
    {
      label: 'Белки (г)',
      data: props.rows.map(r => r.proteins),
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
    },
    {
      label: 'Жиры (г)',
      data: props.rows.map(r => r.fats),
      backgroundColor: 'rgba(234, 179, 8, 0.7)',
    },
    {
      label: 'Углеводы (г)',
      data: props.rows.map(r => r.carbs),
      backgroundColor: 'rgba(34, 197, 94, 0.7)',
    },
    {
      label: 'Стоимость (₽)',
      data: props.rows.map(r => r.cost),
      backgroundColor: 'rgba(168, 85, 247, 0.7)',
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' as const },
  },
  scales: {
    y: { beginAtZero: true },
  },
}
</script>

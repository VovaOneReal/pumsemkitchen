<template>
  <!-- Режим редактирования / создания -->
  <div v-if="isEditing" class="flex items-center gap-2 py-3 border-b border-default">
    <UCheckbox disabled />

    <UInput v-model="draft.name" placeholder="Введите название..." class="flex-1" />

    <!-- Числовой ввод количества -->
    <div class="flex items-center border border-default rounded-lg overflow-hidden">
      <UButton
        icon="i-lucide-minus"
        variant="ghost"
        size="sm"
        :disabled="draft.quantity <= 0"
        @click="draft.quantity = Math.max(0, draft.quantity - 1)"
      />
      <input
        v-model.number="draft.quantity"
        type="number"
        step="0.1"
        min="0"
        class="w-14 text-center text-sm bg-transparent outline-none"
      />
      <UButton icon="i-lucide-plus" variant="ghost" size="sm" @click="draft.quantity++" />
    </div>

    <!-- Выпадающий список мер (только вес, объём, штуки) -->
    <USelect v-model="draft.measurementUnitId" :items="measurementOptions" class="w-32" />

    <!-- Сохранить -->
    <UButton
      icon="i-lucide-save"
      color="primary"
      :loading="saving"
      :disabled="!canSave"
      @click="onSave"
    />

    <!-- Отмена -->
    <UButton icon="i-lucide-circle-x" color="error" variant="subtle" @click="onCancel" />
  </div>

  <!-- Режим просмотра -->
  <div v-else class="flex items-center gap-2 py-3 border-b border-default">
    <UCheckbox v-model="localChecked" :disabled="checking" @change="$emit('check', localChecked)" />

    <span class="flex-1 text-sm" :class="{ 'line-through text-muted': localChecked }">
      {{ name }}
    </span>

    <UBadge v-if="authorName" variant="subtle" color="neutral" icon="i-lucide-user" size="sm">
      {{ authorName }}
    </UBadge>

    <span class="font-bold text-sm whitespace-nowrap">
      {{ quantity }} {{ measurementUnitAbbr }}
    </span>

    <UButton icon="i-lucide-pencil" variant="ghost" size="sm" @click="startEdit" />
    <UButton
      icon="i-lucide-x"
      variant="ghost"
      color="error"
      size="sm"
      :loading="deleting"
      @click="$emit('delete')"
    />
  </div>
</template>

<script lang="ts" setup>
interface Measurement {
  measurement_unit_id: number
  unit_name: string
  unit_abbr: string
  measure_type: string
}

const props = defineProps<{
  id?: number
  name?: string
  quantity?: number
  measurementUnitId?: number
  measurementUnitAbbr?: string
  checked?: boolean
  authorName?: string
  measurements: Measurement[]
  // isNew — элемент только создаётся, у него нет сохранённых данных
  isNew?: boolean
  saving?: boolean
  deleting?: boolean
  checking?: boolean
}>()

const emit = defineEmits<{
  save: [data: { name: string; quantity: number; measurementUnitId: number | null }]
  cancel: []
  delete: []
  check: [value: boolean]
}>()

// Элемент начинает в режиме редактирования, если он новый
const isEditing = ref(props.isNew ?? false)

const localChecked = ref(props.checked ?? false)

// Черновик для редактирования
const draft = reactive({
  name: props.name ?? '',
  quantity: props.quantity ?? 0,
  measurementUnitId: props.measurementUnitId ?? (null as number | null),
})

// Только вес, объём и штуки — без столовых ложек, щепоток и т.п.
const ALLOWED_TYPES = ['weight', 'volume', 'piece']

const measurementOptions = computed(() =>
  props.measurements
    .filter((m) => ALLOWED_TYPES.includes(m.measure_type))
    .map((m) => ({ label: m.unit_abbr, value: m.measurement_unit_id })),
)

const canSave = computed(() => !!draft.name.trim() && draft.measurementUnitId != null)

function startEdit() {
  draft.name = props.name ?? ''
  draft.quantity = props.quantity ?? 0
  draft.measurementUnitId = props.measurementUnitId ?? null
  isEditing.value = true
}

function onSave() {
  if (!canSave.value) return
  emit('save', {
    name: draft.name,
    quantity: draft.quantity,
    measurementUnitId: draft.measurementUnitId,
  })
  if (!props.isNew) isEditing.value = false
}

function onCancel() {
  if (props.isNew) {
    emit('cancel')
  } else {
    isEditing.value = false
  }
}
</script>

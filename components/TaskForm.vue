<template>
  <form @submit.prevent="handleSubmit">
    <input
      v-model="form.title"
      type="text"
      placeholder="タスク名を入力..."
      required
    />
    <textarea
      v-model="form.memo"
      placeholder="メモ（オプション）"
    ></textarea>

    <div v-if="error" class="error-message">{{ error }}</div>
    <div v-if="success" class="success-message">{{ success }}</div>

    <button type="submit">登録する</button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { InputTask } from '../composables/types'

interface Props {
  onAddTask?: (task: InputTask) => void
}

const props = defineProps<Props>()

const emit = defineEmits<{
  addTask: [task: InputTask]
}>()

const form = ref({
  title: '',
  memo: ''
})

const error = ref('')
const success = ref('')

const validateTitle = (title: string): string | null => {
  if (!title || title.trim() === '') {
    return 'タスク名は必須です'
  }
  return null
}

const handleSubmit = () => {
  const validationError = validateTitle(form.value.title)

  if (validationError) {
    error.value = validationError
    success.value = ''
    return
  }

  const task: InputTask = {
    title: form.value.title.trim(),
    memo: form.value.memo.trim()
  }

  // Call prop callback if provided
  if (props.onAddTask) {
    props.onAddTask(task)
  }

  // Emit event
  emit('addTask', task)

  success.value = 'タスクを登録しました'
  error.value = ''
  form.value = { title: '', memo: '' }

  // Auto-hide success message after 3 seconds
  setTimeout(() => {
    success.value = ''
  }, 3000)
}
</script>

<style scoped>
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 500px;
}

input[type="text"],
textarea {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
}

input[type="text"] {
  min-height: 40px;
}

textarea {
  min-height: 80px;
  resize: vertical;
}

button {
  padding: 0.75rem 1.5rem;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
}

button:hover {
  background-color: #0056b3;
}

.error-message {
  color: #d32f2f;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.success-message {
  color: #388e3c;
  font-size: 0.875rem;
  margin-top: 0.5rem;
}
</style>

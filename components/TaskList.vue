<template>
  <div class="task-list">
    <div v-if="tasks.length === 0" class="empty-state">
      <p>タスクが登録されていません</p>
    </div>

    <ul v-else>
      <li v-for="task in tasks" :key="task.id" class="task-item">
        <h3>{{ task.title }}</h3>
        <p v-if="task.memo">{{ task.memo }}</p>
        <small>{{ formatDate(task.createdAt) }}</small>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Task } from '../composables/types'

interface Props {
  tasks: Task[]
}

defineProps<Props>()

const formatDate = (date: Date): string => {
  return new Date(date).toLocaleString('ja-JP')
}
</script>

<style scoped>
.task-list {
  max-width: 600px;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.empty-state p {
  margin: 0;
  font-size: 1rem;
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.task-item {
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-bottom: 0.75rem;
  background-color: #f9f9f9;
}

.task-item h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  color: #333;
}

.task-item p {
  margin: 0.5rem 0;
  color: #666;
  font-size: 0.95rem;
}

.task-item small {
  display: block;
  margin-top: 0.5rem;
  color: #999;
  font-size: 0.85rem;
}
</style>

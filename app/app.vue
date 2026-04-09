<template>
  <div class="app">
    <NuxtRouteAnnouncer />
    <main class="container">
      <h1>タスク管理アプリ</h1>
      <TaskForm @addTask="handleAddTask" />
      <TaskList :tasks="store.tasks" />
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import TaskForm from '../components/TaskForm.vue'
import TaskList from '../components/TaskList.vue'
import { useTaskStore } from '../composables/useTaskStore'
import type { InputTask } from '../composables/types'

const store = useTaskStore()

onMounted(() => {
  store.loadTasks()
})

const handleAddTask = (task: InputTask) => {
  store.addTask(task)
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

h1 {
  color: #333;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}
</style>

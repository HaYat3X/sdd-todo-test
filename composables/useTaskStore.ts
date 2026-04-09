import { reactive } from 'vue'
import type { Task, TaskStoreState, InputTask } from './types'

const STORAGE_KEY = 'tasks'
let taskCounter = 0

export function useTaskStore() {
  const state = reactive<TaskStoreState>({
    tasks: []
  })

  // Save tasks to LocalStorage
  const saveToLocalStorage = (tasks: Task[]): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
    } catch (error) {
      console.error('Failed to save tasks to localStorage:', error)
    }
  }

  // Load tasks from LocalStorage
  const loadFromLocalStorage = (): Task[] | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Failed to load tasks from localStorage:', error)
      return null
    }
  }

  // Add a new task
  const addTask = (input: InputTask): void => {
    taskCounter++
    const newTask: Task = {
      id: `task-${Date.now()}-${taskCounter}`,
      title: input.title,
      memo: input.memo,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    state.tasks.push(newTask)
    saveToLocalStorage(state.tasks)
  }

  // Load tasks from LocalStorage and populate state
  const loadTasks = (): void => {
    const stored = loadFromLocalStorage()
    if (stored) {
      const convertedTasks = stored.map(t => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt)
      }))
      // Clear existing tasks and add new ones to maintain reactivity
      state.tasks.length = 0
      state.tasks.push(...convertedTasks)
    }
  }

  return {
    tasks: state.tasks,
    addTask,
    loadTasks
  }
}

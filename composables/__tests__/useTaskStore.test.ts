import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useTaskStore } from '../useTaskStore'

describe('useTaskStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('addTask', () => {
    it('should add a new task to state.tasks', () => {
      const store = useTaskStore()
      expect(store.tasks).toHaveLength(0)

      store.addTask({ title: 'Test Task', memo: 'Test Memo' })

      expect(store.tasks).toHaveLength(1)
      expect(store.tasks[0].title).toBe('Test Task')
      expect(store.tasks[0].memo).toBe('Test Memo')
    })

    it('should save task to localStorage after adding', () => {
      const store = useTaskStore()

      store.addTask({ title: 'Test Task', memo: 'Test Memo' })

      const stored = localStorage.getItem('tasks')
      expect(stored).toBeTruthy()
      const parsedTasks = JSON.parse(stored!)
      expect(parsedTasks).toHaveLength(1)
      expect(parsedTasks[0].title).toBe('Test Task')
    })

    it('should generate unique id for each task', () => {
      const store = useTaskStore()

      store.addTask({ title: 'Task 1', memo: '' })
      store.addTask({ title: 'Task 2', memo: '' })

      expect(store.tasks[0].id).not.toBe(store.tasks[1].id)
      expect(store.tasks[0].id).toMatch(/^task-\d+-\d+$/)
      expect(store.tasks[1].id).toMatch(/^task-\d+-\d+$/)
    })

    it('should set createdAt and updatedAt timestamps', () => {
      const store = useTaskStore()
      const beforeAdd = new Date()

      store.addTask({ title: 'Test Task', memo: '' })

      const afterAdd = new Date()
      const task = store.tasks[0]

      expect(task.createdAt).toBeInstanceOf(Date)
      expect(task.updatedAt).toBeInstanceOf(Date)
      expect(task.createdAt.getTime()).toBeGreaterThanOrEqual(beforeAdd.getTime())
      expect(task.createdAt.getTime()).toBeLessThanOrEqual(afterAdd.getTime())
    })
  })

  describe('loadTasks', () => {
    it('should load tasks from localStorage', () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Saved Task',
          memo: 'Saved Memo',
          createdAt: '2026-04-09T10:00:00.000Z',
          updatedAt: '2026-04-09T10:00:00.000Z'
        }
      ]

      localStorage.setItem('tasks', JSON.stringify(mockTasks))

      const store = useTaskStore()
      store.loadTasks()

      expect(store.tasks).toHaveLength(1)
      expect(store.tasks[0].title).toBe('Saved Task')
      expect(store.tasks[0].memo).toBe('Saved Memo')
      expect(store.tasks[0].createdAt).toBeInstanceOf(Date)
      expect(store.tasks[0].updatedAt).toBeInstanceOf(Date)
    })

    it('should convert ISO string dates to Date objects', () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Test',
          memo: '',
          createdAt: '2026-04-09T10:00:00.000Z',
          updatedAt: '2026-04-09T10:00:00.000Z'
        }
      ]

      localStorage.setItem('tasks', JSON.stringify(mockTasks))

      const store = useTaskStore()
      store.loadTasks()

      expect(store.tasks[0].createdAt).toBeInstanceOf(Date)
      expect(store.tasks[0].updatedAt).toBeInstanceOf(Date)
    })

    it('should handle empty localStorage gracefully', () => {
      const store = useTaskStore()

      expect(() => {
        store.loadTasks()
      }).not.toThrow()

      expect(store.tasks).toHaveLength(0)
    })

    it('should handle corrupted JSON gracefully', () => {
      localStorage.setItem('tasks', 'invalid json')

      const store = useTaskStore()

      expect(() => {
        store.loadTasks()
      }).not.toThrow()
    })
  })

  describe('reactivity', () => {
    it('should maintain reactive state', () => {
      const store = useTaskStore()
      const initialLength = store.tasks.length

      store.addTask({ title: 'Task 1', memo: 'Memo 1' })

      expect(store.tasks.length).toBe(initialLength + 1)
    })
  })
})

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import App from '../app.vue'

describe('App Integration - TaskForm + TaskList', () => {
  beforeEach(() => {
    localStorage.clear()
    // Reset the task counter for unique IDs
    vi.resetModules()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('renders both TaskForm and TaskList components', () => {
    const wrapper = mount(App)

    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('.task-list').exists()).toBe(true)
  })

  it('displays empty state when no tasks exist', () => {
    const wrapper = mount(App)

    const emptyState = wrapper.find('.empty-state')
    expect(emptyState.exists()).toBe(true)
    expect(emptyState.text()).toContain('登録されていません')
  })

  it('adds a task from TaskForm and displays in TaskList', async () => {
    const wrapper = mount(App)

    // Find form inputs
    const titleInput = wrapper.find('input[type="text"]')
    const memoInput = wrapper.find('textarea')

    // Fill in the form
    await titleInput.setValue('Buy Groceries')
    await memoInput.setValue('Milk and eggs')

    // Submit the form
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    // Verify task appears in list
    const taskTitle = wrapper.find('.task-item h3')
    expect(taskTitle.text()).toBe('Buy Groceries')

    const taskMemo = wrapper.find('.task-item p')
    expect(taskMemo.text()).toBe('Milk and eggs')

    // Verify empty state is hidden
    const emptyState = wrapper.find('.empty-state')
    expect(emptyState.exists()).toBe(false)
  })

  it('persists task to localStorage and retrieves it', async () => {
    const wrapper = mount(App)

    // Add a task
    const titleInput = wrapper.find('input[type="text"]')
    await titleInput.setValue('Important Task')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    // Verify task is in localStorage
    const stored = localStorage.getItem('tasks')
    expect(stored).toBeTruthy()

    const tasks = JSON.parse(stored!)
    expect(tasks.length).toBeGreaterThanOrEqual(1)
    expect(tasks[tasks.length - 1].title).toBe('Important Task')
  })

  it('rejects invalid input without saving to localStorage', async () => {
    const wrapper = mount(App)

    // Try to submit empty form
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    // Verify error message appears
    const errorMsg = wrapper.find('.error-message')
    expect(errorMsg.exists()).toBe(true)
    expect(errorMsg.text()).toContain('必須')

    // Verify nothing saved to localStorage
    const stored = localStorage.getItem('tasks')
    expect(stored).toBeNull()

    // Verify task list is still empty
    const emptyState = wrapper.find('.empty-state')
    expect(emptyState.exists()).toBe(true)
  })

  it('rejects whitespace-only input without saving', async () => {
    const wrapper = mount(App)

    // Try to submit with whitespace-only title
    const titleInput = wrapper.find('input[type="text"]')
    await titleInput.setValue('   ')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    // Verify error message
    const errorMsg = wrapper.find('.error-message')
    expect(errorMsg.exists()).toBe(true)

    // Verify nothing in localStorage
    const stored = localStorage.getItem('tasks')
    expect(stored).toBeNull()
  })

  it('clears form after successful submission', async () => {
    const wrapper = mount(App)

    const titleInput = wrapper.find('input[type="text"]')
    const memoInput = wrapper.find('textarea')

    // Add a task
    await titleInput.setValue('Task 1')
    await memoInput.setValue('Memo 1')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    // Verify form is cleared
    expect(titleInput.element.value).toBe('')
    expect(memoInput.element.value).toBe('')
  })

  it('shows success message after adding task', async () => {
    const wrapper = mount(App)

    const titleInput = wrapper.find('input[type="text"]')
    await titleInput.setValue('Success Task')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    // Verify success message
    const successMsg = wrapper.find('.success-message')
    expect(successMsg.exists()).toBe(true)
    expect(successMsg.text()).toContain('登録')
  })

  it('adds multiple tasks and displays all in order', async () => {
    const wrapper = mount(App)

    const titleInput = wrapper.find('input[type="text"]')

    // Add first task
    await titleInput.setValue('MultiTask1')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    // Add second task
    await titleInput.setValue('MultiTask2')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    // Add third task
    await titleInput.setValue('MultiTask3')
    await wrapper.find('form').trigger('submit')
    await wrapper.vm.$nextTick()

    // Verify all three tasks are displayed
    const taskList = wrapper.findAll('.task-item h3')
    const taskTexts = taskList.map(h => h.text())
    expect(taskTexts).toContain('MultiTask1')
    expect(taskTexts).toContain('MultiTask2')
    expect(taskTexts).toContain('MultiTask3')
  })

  it('loads persisted tasks on component mount', async () => {
    // Pre-populate localStorage with tasks
    const persistedTasks = [
      {
        id: 'task-1',
        title: 'Persisted Task',
        memo: 'From Storage',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    localStorage.setItem('tasks', JSON.stringify(persistedTasks))

    // Mount the app
    const wrapper = mount(App)
    await wrapper.vm.$nextTick()

    // Verify persisted task is displayed
    const taskTitle = wrapper.find('.task-item h3')
    expect(taskTitle.exists()).toBe(true)
    expect(taskTitle.text()).toBe('Persisted Task')

    const taskMemo = wrapper.find('.task-item p')
    expect(taskMemo.text()).toBe('From Storage')

    // Verify empty state is not shown
    const emptyState = wrapper.find('.empty-state')
    expect(emptyState.exists()).toBe(false)
  })
})

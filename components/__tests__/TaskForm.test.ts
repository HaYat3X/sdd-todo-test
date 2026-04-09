import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskForm from '../TaskForm.vue'

describe('TaskForm', () => {
  it('renders form with input fields', () => {
    const wrapper = mount(TaskForm)

    expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    expect(wrapper.find('textarea').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('accepts user input in title field', async () => {
    const wrapper = mount(TaskForm)
    const titleInput = wrapper.find('input[type="text"]')

    await titleInput.setValue('Test Task')

    expect(titleInput.element.value).toBe('Test Task')
  })

  it('accepts user input in memo field', async () => {
    const wrapper = mount(TaskForm)
    const memoInput = wrapper.find('textarea')

    await memoInput.setValue('Test Memo')

    expect(memoInput.element.value).toBe('Test Memo')
  })

  it('rejects empty title validation', async () => {
    const wrapper = mount(TaskForm)

    await wrapper.find('form').trigger('submit')

    const errorMsg = wrapper.find('.error-message')
    expect(errorMsg.exists()).toBe(true)
    expect(errorMsg.text()).toContain('必須')
  })

  it('rejects whitespace-only title', async () => {
    const wrapper = mount(TaskForm)
    const titleInput = wrapper.find('input[type="text"]')

    await titleInput.setValue('   ')
    await wrapper.find('form').trigger('submit')

    const errorMsg = wrapper.find('.error-message')
    expect(errorMsg.exists()).toBe(true)
  })

  it('accepts valid title and calls addTask', async () => {
    const mockAddTask = vi.fn()
    const wrapper = mount(TaskForm, {
      props: {
        onAddTask: mockAddTask
      }
    })

    const titleInput = wrapper.find('input[type="text"]')
    const memoInput = wrapper.find('textarea')

    await titleInput.setValue('Valid Task')
    await memoInput.setValue('Valid Memo')
    await wrapper.find('form').trigger('submit')

    expect(mockAddTask).toHaveBeenCalledWith({
      title: 'Valid Task',
      memo: 'Valid Memo'
    })
  })

  it('clears form after successful submission', async () => {
    const wrapper = mount(TaskForm)
    const titleInput = wrapper.find('input[type="text"]')
    const memoInput = wrapper.find('textarea')

    await titleInput.setValue('Task')
    await memoInput.setValue('Memo')
    await wrapper.find('form').trigger('submit')

    expect(titleInput.element.value).toBe('')
    expect(memoInput.element.value).toBe('')
  })

  it('shows success message after valid submission', async () => {
    const wrapper = mount(TaskForm)
    const titleInput = wrapper.find('input[type="text"]')

    await titleInput.setValue('Valid Task')
    await wrapper.find('form').trigger('submit')

    const successMsg = wrapper.find('.success-message')
    expect(successMsg.exists()).toBe(true)
    expect(successMsg.text()).toContain('登録')
  })

  it('clears error message on subsequent valid submission', async () => {
    const wrapper = mount(TaskForm)
    const titleInput = wrapper.find('input[type="text"]')

    // First: invalid submission
    await wrapper.find('form').trigger('submit')
    expect(wrapper.find('.error-message').exists()).toBe(true)

    // Second: valid submission
    await titleInput.setValue('Valid Task')
    await wrapper.find('form').trigger('submit')

    expect(wrapper.find('.error-message').exists()).toBe(false)
    expect(wrapper.find('.success-message').exists()).toBe(true)
  })

  it('trims title and memo before submission', async () => {
    const mockAddTask = vi.fn()
    const wrapper = mount(TaskForm, {
      props: {
        onAddTask: mockAddTask
      }
    })

    const titleInput = wrapper.find('input[type="text"]')
    const memoInput = wrapper.find('textarea')

    await titleInput.setValue('  Task  ')
    await memoInput.setValue('  Memo  ')
    await wrapper.find('form').trigger('submit')

    expect(mockAddTask).toHaveBeenCalledWith({
      title: 'Task',
      memo: 'Memo'
    })
  })
})

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TaskList from '../TaskList.vue'
import type { Task } from '../../composables/types'

describe('TaskList', () => {
  it('renders empty state message when tasks are empty', () => {
    const wrapper = mount(TaskList, {
      props: {
        tasks: []
      }
    })

    const emptyState = wrapper.find('.empty-state')
    expect(emptyState.exists()).toBe(true)
    expect(emptyState.text()).toContain('登録されていません')
  })

  it('renders task list when tasks exist', () => {
    const tasks: Task[] = [
      {
        id: 'task-1',
        title: 'Test Task',
        memo: 'Test Memo',
        createdAt: new Date('2026-04-09T10:00:00'),
        updatedAt: new Date('2026-04-09T10:00:00')
      }
    ]

    const wrapper = mount(TaskList, {
      props: {
        tasks
      }
    })

    const list = wrapper.find('ul')
    expect(list.exists()).toBe(true)

    const items = wrapper.findAll('li')
    expect(items).toHaveLength(1)
  })

  it('displays task title in h3 tag', () => {
    const tasks: Task[] = [
      {
        id: 'task-1',
        title: 'Buy Groceries',
        memo: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    const wrapper = mount(TaskList, {
      props: {
        tasks
      }
    })

    const title = wrapper.find('h3')
    expect(title.exists()).toBe(true)
    expect(title.text()).toBe('Buy Groceries')
  })

  it('displays task memo when present', () => {
    const tasks: Task[] = [
      {
        id: 'task-1',
        title: 'Task',
        memo: 'Important Memo',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    const wrapper = mount(TaskList, {
      props: {
        tasks
      }
    })

    const memo = wrapper.find('p')
    expect(memo.exists()).toBe(true)
    expect(memo.text()).toBe('Important Memo')
  })

  it('does not display memo paragraph when memo is empty', () => {
    const tasks: Task[] = [
      {
        id: 'task-1',
        title: 'Task',
        memo: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    const wrapper = mount(TaskList, {
      props: {
        tasks
      }
    })

    const memo = wrapper.find('p')
    expect(memo.exists()).toBe(false)
  })

  it('displays creation timestamp in small tag', () => {
    const date = new Date('2026-04-09T10:00:00')
    const tasks: Task[] = [
      {
        id: 'task-1',
        title: 'Task',
        memo: '',
        createdAt: date,
        updatedAt: date
      }
    ]

    const wrapper = mount(TaskList, {
      props: {
        tasks
      }
    })

    const timestamp = wrapper.find('small')
    expect(timestamp.exists()).toBe(true)
    // Check that it contains a date-like string
    expect(timestamp.text()).toMatch(/\d{4}/)
  })

  it('renders multiple tasks in correct order', () => {
    const tasks: Task[] = [
      {
        id: 'task-1',
        title: 'First Task',
        memo: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'task-2',
        title: 'Second Task',
        memo: '',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'task-3',
        title: 'Third Task',
        memo: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    const wrapper = mount(TaskList, {
      props: {
        tasks
      }
    })

    const titles = wrapper.findAll('h3')
    expect(titles).toHaveLength(3)
    expect(titles[0].text()).toBe('First Task')
    expect(titles[1].text()).toBe('Second Task')
    expect(titles[2].text()).toBe('Third Task')
  })

  it('hides empty state when tasks exist', () => {
    const tasks: Task[] = [
      {
        id: 'task-1',
        title: 'Task',
        memo: '',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    const wrapper = mount(TaskList, {
      props: {
        tasks
      }
    })

    const emptyState = wrapper.find('.empty-state')
    expect(emptyState.exists()).toBe(false)
  })

  it('renders task items with all required elements', () => {
    const tasks: Task[] = [
      {
        id: 'unique-id-1',
        title: 'Task 1',
        memo: 'Memo 1',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    const wrapper = mount(TaskList, {
      props: {
        tasks
      }
    })

    const item = wrapper.find('li')
    expect(item.find('h3').exists()).toBe(true)
    expect(item.find('p').exists()).toBe(true)
    expect(item.find('small').exists()).toBe(true)
  })
})

// Task entity type definition
export interface Task {
  id: string
  title: string
  memo: string
  createdAt: Date
  updatedAt: Date
}

// Task store state interface
export interface TaskStoreState {
  tasks: Task[]
}

// Input task type definition
export interface InputTask {
  title: string
  memo: string
}

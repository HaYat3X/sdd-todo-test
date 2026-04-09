# タスク管理アプリケーション 設計書

## 概要

本設計書は、Nuxt 3 を使用したタスク管理アプリケーションの実装方針を定義する。ユーザーはタスク名（必須）とメモ（オプション）を入力してタスクを登録でき、登録済みタスクを一覧表示できる。LocalStorage を利用した永続化により、ブラウザ再起動後もタスク情報が保持される。

**対象ユーザー:** 日常的なタスク管理が必要なエンドユーザー  
**実装規模:** MVP（Minimum Viable Product）レベル、スタンドアロン SPA  

### 目標

- ユーザーが直感的にタスクを登録・表示できる UI を提供
- 入力値を適切に検証し、不正なデータの保存を防止
- ブラウザの LocalStorage を利用して、永続的にタスク情報を保存
- Nuxt 3 + Vue 3 の仕様駆動開発（cc-sdd）プロセスを検証

### 非目標

- リモートサーバーでの同期機能
- ユーザー認証・マルチユーザー対応
- タスク編集・削除機能（今後の拡張）
- タスク優先度・期限管理

---

## アーキテクチャ

### アーキテクチャパターンと境界図

**選択パターン:** クライアント側状態管理を中心とした単一ページアプリケーション（SPA）

```
┌─────────────────────────────────────────────────┐
│              Nuxt 3 Application                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────────┐   │
│  │         Vue 3 Components                │   │
│  │  ┌──────────────┐  ┌──────────────────┐│   │
│  │  │ TaskForm     │  │ TaskList         ││   │
│  │  │ (register)   │  │ (display)        ││   │
│  │  └──────────────┘  └──────────────────┘│   │
│  └──────────────┬───────────────────────────┘   │
│                 │                               │
│  ┌──────────────▼───────────────────────────┐   │
│  │    Composable (State Management)         │   │
│  │  useTaskStore()                          │   │
│  │  - tasks (reactive state)                │   │
│  │  - addTask(), loadTasks()                │   │
│  └──────────────┬───────────────────────────┘   │
│                 │                               │
│  ┌──────────────▼───────────────────────────┐   │
│  │   LocalStorage Adapter                   │   │
│  │  - save(), load()                        │   │
│  └──────────────┬───────────────────────────┘   │
│                 │                               │
└─────────────────┼───────────────────────────────┘
                  │
          ┌───────▼────────┐
          │  Browser Local │
          │    Storage     │
          └────────────────┘
```

### テクノロジースタック

| レイヤー | 選択技術 / バージョン | 機能における役割 | 補足 |
|---------|-------------------|---------------|------|
| Frontend / UI | Nuxt 3, Vue 3 | 画面レンダリング、ユーザーインタラクション | SSR不要、CSR で十分 |
| State Management | Vue 3 Composable API | グローバル状態管理（Pinia より軽量） | useTaskStore() で実装 |
| Data / Storage | Browser LocalStorage | タスク永続化 | JSON シリアライズ |
| Validation | 独自ロジック | 入力値検証（title の空判定） | 複雑な検証ロジック不要 |
| Runtime | Node.js 18+ | ビルド・開発時 | Nuxt 3 の推奨環境 |

---

## システムフロー

### タスク登録フロー

```
┌─────────────────────────────────────┐
│ ユーザー                             │
└────────────────────┬────────────────┘
                     │
                     │ (1) タスク名とメモを入力
                     ▼
        ┌────────────────────────┐
        │ TaskForm コンポーネント  │
        │  - title 入力フィールド  │
        │  - memo 入力フィールド   │
        │  - 登録ボタン           │
        └────────┬───────────────┘
                 │
                 │ (2) 登録ボタンクリック
                 ▼
        ┌────────────────────────┐
        │ 入力値バリデーション     │
        │  - title 非空チェック    │
        │  - スペースのみチェック  │
        └────────┬───────────────┘
                 │
         ┌───────┴────────┐
         │ 結果           │
         ├─────────┬──────┤
    (3a) エラー  │ (3b) OK
         │       │
         ▼       ▼
    エラー表示  useTaskStore()
    (フォーム    .addTask()
     にフォーカス)│
              ▼
        LocalStorage
        に保存
         │
         ▼
    TaskList へ
    リアルタイム反映
         │
         ▼
    確認メッセージ表示
    フォームリセット
```

### タスク表示フロー

```
┌──────────────────────────────────┐
│ app.vue / Page Load              │
└────────────────┬─────────────────┘
                 │
                 │ (1) onMounted で初期化
                 ▼
        ┌────────────────────────┐
        │ useTaskStore()         │
        │  .loadTasks()          │
        │  (LocalStorage から取得)│
        └────────┬───────────────┘
                 │
                 │ (2) reactive state に展開
                 ▼
        ┌────────────────────────┐
        │ TaskList コンポーネント  │
        │ (v-for で tasks を描画) │
        │  - タスク名表示        │
        │  - メモ表示           │
        │  - 0件時: 空状態表示   │
        └────────────────────────┘
```

---

## 要件トレーサビリティ

| 要件ID | 概要 | 実装コンポーネント | 主要インターフェース | フロー |
|--------|------|-------------------|-------------------|--------|
| 1.1-1.9 | タスク登録 | TaskForm, useTaskStore | addTask() | タスク登録フロー |
| 2.1-2.6 | タスク表示 | TaskList, useTaskStore | loadTasks(), tasks | タスク表示フロー |
| 3.1-3.4 | 入力バリデーション | ValidationUtils, TaskForm | validateTitle() | 登録フロー内 |
| 4.1-4.3 | データ永続化 | TaskStore, LocalStorageAdapter | save(), load() | 登録・表示フロー |

---

## コンポーネント設計

### コンポーネント概要

| コンポーネント | ドメイン | 目的 | 要件カバレッジ | 主要依存 |
|--------------|---------|------|--------------|---------|
| TaskForm | UI / 入力 | タスク登録フォーム | 1.1-1.9, 3.1-3.4 | useTaskStore |
| TaskList | UI / 表示 | タスク一覧表示 | 2.1-2.6 | useTaskStore |
| useTaskStore | State | グローバル状態管理 | 1.5-1.7, 2.1-2.5, 4.1-4.3 | LocalStorageAdapter |

### UI / 入力層

#### TaskForm コンポーネント

| 項目 | 詳細 |
|------|------|
| 目的 | タスク登録フォームの UI を提供、入力イベント処理 |
| 要件ID | 1.1, 1.2, 1.3, 1.4, 1.6, 1.8, 1.9, 3.1-3.4 |
| 責務 | タスク名・メモの入力受付、登録ボタンクリック処理、バリデーションエラー表示 |

**責務と制約**
- ユーザー入力（title, memo）を受け取り、入力値をリアルタイムでローカル状態に更新
- 登録ボタンクリック時、入力値のバリデーションを実行
- バリデーションエラー時、エラーメッセージをユーザーに表示してから登録を中止
- 登録成功時、確認メッセージを表示してフォームをリセット

**依存関係**
- 内向き: useTaskStore — タスク追加時の呼び出し (P0)
- 外向き: Vue 3 Reactivity API — フォーム状態管理 (P0)

**インターフェース**

```vue
<!-- TaskForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <input 
      v-model="form.title" 
      placeholder="タスク名を入力..."
      type="text"
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
import { useTaskStore } from '~/composables/useTaskStore'

const taskStore = useTaskStore()
const form = ref({ title: '', memo: '' })
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
  
  taskStore.addTask({
    title: form.value.title.trim(),
    memo: form.value.memo.trim()
  })
  
  success.value = 'タスクを登録しました'
  error.value = ''
  form.value = { title: '', memo: '' }
  
  setTimeout(() => { success.value = '' }, 3000)
}
</script>
```

**実装上の注記**
- title のバリデーション: 空文字列、スペースのみの入力を拒否
- メモ: オプション入力、保存前に trim() で前後の空白を削除
- エラーメッセージ: フォーム内にインラインで表示
- 成功メッセージ: 3 秒後に自動消去

---

### UI / 表示層

#### TaskList コンポーネント

| 項目 | 詳細 |
|------|------|
| 目的 | 登録済みタスクの一覧表示 |
| 要件ID | 2.1-2.6 |
| 責務 | tasks 配列を v-for で反復描画、空状態を適切に処理 |

**責務と制約**
- useTaskStore().tasks をリアクティブに監視し、変更を自動で UI に反映
- タスク 0 件時は空状態メッセージを表示
- 各タスク行に title とメモを表示

**依存関係**
- 内向き: useTaskStore — tasks 取得と監視 (P0)
- 外向き: Vue 3 Reactivity (computed, watch) — リアクティブ描画 (P0)

**インターフェース**

```vue
<!-- TaskList.vue -->
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
import { computed } from 'vue'
import { useTaskStore } from '~/composables/useTaskStore'

const taskStore = useTaskStore()
const tasks = computed(() => taskStore.tasks)

const formatDate = (date: Date) => {
  return new Date(date).toLocaleString('ja-JP')
}
</script>
```

**実装上の注記**
- tasks: useTaskStore から computed で取得、リアクティブに監視
- v-key: task.id を使用、リストの一意性を保証
- 空状態: タスク 0 件時の UX を考慮
- タイムスタンプ表示: 登録日時を日本語フォーマットで表示

---

### 状態管理層

#### useTaskStore() Composable

| 項目 | 詳細 |
|------|------|
| 目的 | タスクのグローバル状態管理と永続化ロジック |
| 要件ID | 1.5, 1.7, 2.1-2.5, 4.1-4.3 |
| 責務 | tasks 配列のリアクティブ管理、LocalStorage との同期、CRUD メソッド提供 |

**責務と制約**
- グローバル tasks 状態を管理（reactive）
- 追加時、新タスクに自動で id, createdAt, updatedAt を付与
- 毎回の状態変更後、LocalStorage に自動保存（永続化）
- 初期化時、LocalStorage からタスク情報を復元
- トランザクション境界: 単一タスク追加が単位

**依存関係**
- 外向き: LocalStorageAdapter — save(), load() 呼び出し (P0)
- 外向き: Vue 3 Reactivity (reactive) — リアクティブ状態 (P0)

**インターフェース**

```typescript
// composables/useTaskStore.ts
import { reactive } from 'vue'

interface Task {
  id: string
  title: string
  memo: string
  createdAt: Date
  updatedAt: Date
}

interface TaskStoreState {
  tasks: Task[]
}

export function useTaskStore() {
  const state = reactive<TaskStoreState>({
    tasks: []
  })

  const addTask = (input: { title: string; memo: string }) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: input.title,
      memo: input.memo,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    state.tasks.push(newTask)
    saveToLocalStorage(state.tasks)
  }

  const loadTasks = () => {
    const stored = loadFromLocalStorage()
    if (stored) {
      state.tasks = stored.map(t => ({
        ...t,
        createdAt: new Date(t.createdAt),
        updatedAt: new Date(t.updatedAt)
      }))
    }
  }

  const saveToLocalStorage = (tasks: Task[]) => {
    localStorage.setItem(
      'tasks',
      JSON.stringify(tasks)
    )
  }

  const loadFromLocalStorage = (): Task[] | null => {
    const stored = localStorage.getItem('tasks')
    return stored ? JSON.parse(stored) : null
  }

  return {
    tasks: state.tasks,
    addTask,
    loadTasks
  }
}
```

**実装上の注記**
- id 生成: タイムスタンプベース（シンプル、サーバー不要）
- リアクティブ性: reactive() で tasks 配列の変更を自動追跡
- LocalStorage キー: 固定キー "tasks" で統一
- 日付変換: JSON シリアライズ時は ISO 文字列、ロード時に Date オブジェクトに再変換

---

## データモデル

### ドメインモデル

```
Task Aggregate
├── id: string (唯一識別子)
├── title: string (必須, 非空)
├── memo: string (オプション)
└── Temporal Properties
    ├── createdAt: Date
    └── updatedAt: Date
```

**不変条件:**
- title は必ず非空かつトリミング後も空でない
- id は生成後変更不可
- createdAt は変更不可（作成時のみセット）

### 論理データモデル

**Task エンティティ:**

| 属性 | 型 | 制約 | 説明 |
|------|----|----|------|
| id | string | 主キー、一意 | 生成時のタイムスタンプベース |
| title | string | NOT NULL, 非空 | タスク名 |
| memo | string | NULL 許容 | オプションのメモ |
| createdAt | Date | NOT NULL | 作成日時 |
| updatedAt | Date | NOT NULL | 更新日時 |

### 物理データモデル（LocalStorage）

**ストレージフォーマット: JSON Array**

```json
[
  {
    "id": "task-1712700000000",
    "title": "買い物に行く",
    "memo": "牛乳とパンを買う",
    "createdAt": "2026-04-09T10:00:00.000Z",
    "updatedAt": "2026-04-09T10:00:00.000Z"
  }
]
```

**ストレージキー:** `"tasks"`  
**容量制限:** LocalStorage 5-10 MB（MVP では影響なし）  
**有効期限:** ブラウザセッション終了まで保持、ユーザー手動削除まで消失しない  

---

## エラーハンドリング

### エラーカテゴリと対応

**入力エラー (Validation Errors)**
- 発生箇所: TaskForm.handleSubmit()
- 例: 空の title, スペースのみの title
- 対応: フォーム内にインラインエラーメッセージ表示、登録中止
- ユーザーガイダンス: "タスク名は必須です" など明確なメッセージ

**LocalStorage エラー**
- 発生可能性: ブラウザストレージ満杯時など
- 対応: try-catch で JSON.parse/stringify をラップ、フォールバック
- ユーザーガイダンス: "保存に失敗しました。ブラウザストレージをご確認ください"（MVP では最小限）

**リカバリー戦略**
- 入力エラー: ユーザーが修正して再登録
- LocalStorage エラー: ブラウザキャッシュをクリアして再試行（ユーザー側対応）

---

## テスト戦略

### 単体テスト

**useTaskStore.ts**
1. addTask() が新タスクを state.tasks に追加する
2. addTask() が LocalStorage に保存する
3. loadTasks() が LocalStorage から復元する
4. addTask() の id が一意である

**TaskForm.vue**
1. validateTitle() が空文字列を拒否する
2. validateTitle() がスペースのみの文字列を拒否する
3. handleSubmit() がエラー時に addTask() を呼ばない
4. handleSubmit() が成功時にフォームをリセットする

**TaskList.vue**
1. tasks が空のとき、空状態メッセージを表示する
2. tasks に要素があるとき、v-for でリストを描画する
3. 各タスクアイテムに title とメモが表示される

### 統合テスト

1. TaskForm に値を入力して登録ボタンをクリック → TaskList に新タスク表示
2. ページリロード後、LocalStorage から復元したタスクが表示される
3. 無効な入力（空の title）で登録 → エラーメッセージ表示、LocalStorage に保存されない
4. メモ付きタスク登録 → メモがタスク一覧に表示される

### E2E テスト（Playwright など）

1. ユーザーが新規タスクを登録すると、一覧に即座に表示される
2. ブラウザを再起動してもタスクが表示される（永続化確認）
3. 空タイトルで登録しようとするとエラーメッセージが表示される
4. 複数タスクが正しい順序で表示される

---

## 実装上の留意点

### マイグレーション戦略

初版実装のため、マイグレーションは不要。ただし、将来的なデータスキーマ変更時は以下を検討：
- LocalStorage キーにバージョン情報を含める（例: "tasks_v1"）
- ロード時にスキーマバージョンをチェックし、アップデート関数を実行

### セキュリティ考慮事項（MVP）

- 本アプリケーションはクライアント側のみで動作するため、サーバーサイド認証は不要
- LocalStorage は同一オリジンのすべてのスクリプトからアクセス可能（XSS 対策は別途）
- タスク情報は機密でないと仮定（暗号化不要）

### パフォーマンス・スケーラビリティ

- **ターゲット:** 数百タスク程度（MVP）
- LocalStorage 容量: 5-10 MB（十分）
- タスク取得: O(1)（reactive array）
- 追加・表示: O(n)、MVP スケールでは問題なし
- 今後、数千タスク以上が想定される場合は、Indexed DB への移行を検討

---

## 設計の根拠

**Nuxt 3 + Vue 3 Composable 選択理由:**
- 仕様駆動開発の検証が目的のため、実装を最小化
- Pinia などの外部状態管理ライブラリを避け、標準 API で完結
- Composable は再利用可能でテストしやすい

**LocalStorage 選択理由:**
- サーバー不要（MVP、スタンドアロン SPA）
- シンプルな JSON シリアライズで十分
- 開発時間短縮

**コンポーネント分割:**
- TaskForm と TaskList を分離 → 責務を明確化
- useTaskStore をカスタム Composable で実装 → テスト可能

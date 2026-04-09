# 実装計画

## 概要

タスク管理アプリケーションの実装を5つのメジャータスクに分解し、段階的に完成させる。

---

## タスク一覧

- [x] 1. プロジェクトセットアップと環境構築
- [x] 1.1 Nuxt 3 プロジェクト初期化とゼロコンフィグ設定
  - Nuxt 3 プロジェクトを `npm create nuxt-app@latest` で初期化
  - TypeScript サポート有効化
  - Vue 3 Composition API が標準で使用可能な環境確認
  -開発サーバー起動確認 (`npm run dev`)
  - _Requirements: なし（基礎構築）_

- [x] 1.2 プロジェクト構造とフォルダ配置の確立
  - `composables/` ディレクトリ作成（状態管理用）
  - `components/` ディレクトリ整備（UI コンポーネント用）
  - `utils/` ディレクトリ作成（ユーティリティ関数用）
  - ESLint・Prettier の基本設定確認
  - _Requirements: なし（基礎構築）_

---

- [x] 2. 状態管理層 - useTaskStore() Composable 実装
- [x] 2.1 (P) Task インターフェース定義と型設定
  - Task エンティティ型定義（id, title, memo, createdAt, updatedAt）
  - TaskStoreState インターフェース定義
  - InputTask 入力型定義（title, memo）
  - `types/` または `composables/` に型定義ファイルを配置
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 2.2 (P) useTaskStore() Composable 実装 - 基本機能
  - reactive() で tasks 配列を初期化
  - addTask() メソッド実装（新タスク追加、id/timestamp 自動生成）
  - loadTasks() メソッド実装（初期化時の起動）
  - tasks プロパティ公開（リアクティブ参照）
  - _Requirements: 1.5, 1.7, 2.1, 2.5, 4.1, 4.2, 4.3_

- [x] 2.3 (P) LocalStorage アダプター実装
  - saveToLocalStorage() 関数実装（JSON シリアライズ、"tasks" キー固定）
  - loadFromLocalStorage() 関数実装（JSON パース、エラーハンドリング）
  - addTask() 後に自動保存するロジック統合
  - Date オブジェクトの ISO 文字列との変換処理
  - _Requirements: 4.1, 4.3_

- [x] 2.4 useTaskStore() 単体テスト
  - addTask() が新タスクを state.tasks に追加することを確認
  - addTask() が LocalStorage に保存することを確認
  - loadTasks() が LocalStorage から復元することを確認
  - addTask() の id が一意であることを確認
  - _Requirements: 1.5, 2.1, 4.1, 4.2, 4.3_

---

- [x] 3. (P) 入力層 - TaskForm コンポーネント実装
- [x] 3.1 (P) TaskForm コンポーネント - フォーム UI
  - `<input>` フィールド（title 用、v-model バインディング）
  - `<textarea>` フィールド（memo 用、v-model バインディング）
  - 登録ボタン実装（@submit.prevent="handleSubmit"）
  - フォーム状態管理（ref で form オブジェクト）
  - _Requirements: 1.1, 1.2, 1.3, 1.8, 1.9_

- [x] 3.2 (P) タイトル検証ロジック実装
  - validateTitle() 関数（空文字列拒否、スペースのみ拒否）
  - handleSubmit() 内で登録前にバリデーション実行
  - バリデーション失敗時は登録中止
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [x] 3.3 (P) エラー・成功メッセージ表示
  - error ref（バリデーションエラー時の表示）
  - success ref（登録成功時の表示）
  - エラー時はフォーム内にインラインで表示
  - 成功メッセージは 3 秒後に自動消去
  - _Requirements: 1.4, 1.6, 3.1, 3.2, 3.4_

- [x] 3.4 (P) フォーム送信ロジック統合
  - handleSubmit() 実装（バリデーション→addTask()→リセット）
  - useTaskStore からの addTask() メソッド呼び出し
  - 成功後、form をリセット（title='', memo=''）
  - _Requirements: 1.4, 1.5, 1.6, 3.3_

- [x] 3.5 TaskForm 単体テスト
  - validateTitle() が空文字列を拒否することを確認
  - validateTitle() がスペースのみを拒否することを確認
  - handleSubmit() がエラー時に addTask() を呼ばないことを確認
  - handleSubmit() が成功時にフォームをリセットすることを確認
  - _Requirements: 1.1, 1.4, 3.1, 3.2, 3.3, 3.4_

---

- [x] 4. (P) 表示層 - TaskList コンポーネント実装
- [x] 4.1 (P) TaskList コンポーネント - 基本構造
  - `<div class="task-list">` ルート要素
  - useTaskStore().tasks を computed で取得
  - tasks リアクティブ監視の確認
  - コンポーネントマウント時（onMounted）の初期化の準備
  - _Requirements: 2.1, 2.5, 2.6_

- [x] 4.2 (P) タスク一覧描画 - v-for ループ
  - `<ul>` / `<li>` でタスク反復描画
  - `v-for="task in tasks" :key="task.id"`
  - 各タスク行に title を `<h3>` で表示
  - メモが存在する場合は `<p>` で表示
  - _Requirements: 2.2, 2.3, 2.6_

- [x] 4.3 (P) 空状態メッセージ表示
  - `v-if="tasks.length === 0"` で空状態判定
  - "タスクが登録されていません" メッセージ表示
  - 空状態時は `<ul>` を表示しない
  - _Requirements: 2.4_

- [x] 4.4 (P) タイムスタンプ表示フォーマット
  - createdAt を日本語フォーマットで表示（`toLocaleString('ja-JP')`）
  - `<small>` タグで作成日時を表示
  - _Requirements: 2.3_

- [x] 4.5 TaskList 単体テスト
  - tasks が空のとき、空状態メッセージが表示されることを確認
  - tasks に要素があるとき、v-for でリストが描画されることを確認
  - 各タスク行に title とメモが表示されることを確認
  - 複数タスクが正しい順序で表示されることを確認
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6_

---

- [x] 5. 統合とエンドツーエンドテスト
- [x] 5.1 app.vue で TaskForm と TaskList を統合
  - `<TaskForm />` と `<TaskList />` を app.vue で import・配置
  - app.vue の onMounted() で useTaskStore().loadTasks() を実行
  - 両コンポーネント間のデータ流通確認（TaskForm 登録 → TaskList 更新）
  - _Requirements: 1.5, 1.7, 2.1, 2.5_

- [x] 5.2 統合テスト - フォーム入力から一覧表示まで
  - TaskForm に値を入力、登録ボタンクリック
  - TaskList に新タスクが即座に表示される
  - 無効入力（空 title）で登録試行 → エラーメッセージ表示、LocalStorage に保存されない
  - メモ付きタスク登録 → メモが一覧に表示される
  - _Requirements: 1.1, 1.4, 1.5, 1.6, 2.1, 2.2, 2.3, 2.5, 2.6, 3.1, 3.3, 3.4_

- [x] 5.3 E2E テスト（Playwright）- ブラウザレベル検証
  - 新規タスク登録フロー（title 入力 → 登録 → 一覧に表示）
  - ブラウザ再起動シミュレーション → LocalStorage から復元確認
  - 空 title での登録試行 → エラー表示確認
  - 複数タスク管理シナリオ
  - _Requirements: 1.1, 2.1, 2.5, 4.2_

- [x] 5.4 手動テストとブラウザ互換性確認
  - Chrome/Firefox/Safari でのレンダリング確認
  - フォーム操作（キーボード入力、ボタンクリック）
  - LocalStorage 永続化確認（ブラウザ再起動）
  - レスポンシブデザイン確認（デスクトップ）
  - _Requirements: 1.1, 2.1, 4.1, 4.2, 4.3_

---

## 要件カバレッジ確認

### Requirement 1: タスク登録機能
- 1.1: Task 3.1
- 1.2: Task 3.1
- 1.3: Task 3.1
- 1.4: Task 3.2, 3.3
- 1.5: Task 2.2, 3.4, 5.1
- 1.6: Task 3.3, 3.4
- 1.7: Task 2.2, 5.1
- 1.8: Task 3.1
- 1.9: Task 3.1

### Requirement 2: タスク表示機能
- 2.1: Task 2.2, 4.1, 5.2, 5.3
- 2.2: Task 4.2, 5.2
- 2.3: Task 4.2, 4.4, 5.2
- 2.4: Task 4.3, 5.2
- 2.5: Task 2.2, 4.1, 5.1, 5.3
- 2.6: Task 3.1, 4.1, 4.2, 4.5, 5.2

### Requirement 3: 入力バリデーション
- 3.1: Task 3.2, 3.3, 5.2
- 3.2: Task 3.2, 3.3, 5.2
- 3.3: Task 3.2, 3.4, 5.2
- 3.4: Task 3.3, 3.4, 5.2

### Requirement 4: データ永続化
- 4.1: Task 2.3, 2.4
- 4.2: Task 2.3, 2.4
- 4.3: Task 2.1, 2.3, 2.4, 5.4

---

## 実装の流れ

1. **Task 1**: 環境・基礎構築（前提条件）
2. **Task 2**: 状態管理層実装（コア基盤）
3. **Tasks 3・4**: TaskForm と TaskList の並列実装（2 に依存）
4. **Task 5**: 統合・テスト（3・4 に依存）

**並列実行可能:** Task 3 と Task 4 は独立して実装可能（両者とも Task 2 に依存）

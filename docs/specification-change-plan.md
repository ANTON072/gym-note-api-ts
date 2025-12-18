# 構造の変更プラン

## フロント側の画面構成の変更

フロント側の画面構成が以下のように変更になった。

1. 本日のワークアウトを追加ボタンをタップ
2. 本日のワークアウト一覧のページに遷移
   - このページは日付ごとのワークアウト一覧のページとしても利用する
   - 実施したワークアウトの一覧が並ぶ
   - ワークアウトは並び替えが可能
   - メモはワークアウトごとにできるので、ここでは不要
3. 種目の選択画面に進み、種目を一つ選択するとセットの画面に進む
   - 実施したい種目がない場合は種目を作ることができる
   - 有酸素運動も選択できる
     - 有酸素運動は距離、時間、速さ、カロリーを登録ができる
4. ワークアウトの画面を表示
   - 重さ、回数、メモを登録できる
   - この種目に対する全セットをこの画面で登録する
   - 自動保存
   - 完了ボタンで2の画面に戻る

---

## 用語の定義

| 用語           | 説明                                         | 例                         |
| -------------- | -------------------------------------------- | -------------------------- |
| トレーニング日 | ある日のトレーニング全体（日付、場所、時間） | 2024/1/15 10:00-11:30 ジム |
| ワークアウト   | 1つの種目の実施記録（種目＋セット群＋メモ）  | ベンチプレスを3セット      |
| セット         | 1セットの記録（重量、回数など）              | 60kg × 10回                |

---

## 変更計画

### テーブル名の変更

用語とテーブル名を一致させるため、テーブル名を変更する。

| 現在のテーブル名  | 新しいテーブル名      | 用語           |
| ----------------- | --------------------- | -------------- |
| workouts          | **training_sessions** | トレーニング日 |
| workout_exercises | **workouts**          | ワークアウト   |
| workout_sets      | workout_sets          | セット         |
| exercises         | exercises             | 種目           |
| users             | users                 | ユーザー       |

### 新しいER図

```
users → training_sessions → workouts → workout_sets
                       ↗
                 exercises
```

---

### DB構造（5テーブル構成）

| テーブル          | 役割                                     |
| ----------------- | ---------------------------------------- |
| users             | ユーザー管理                             |
| training_sessions | トレーニング日（日付、場所、時間）       |
| exercises         | 種目マスタ（プリセット＋カスタム）       |
| workouts          | ワークアウト（並び順、メモ）             |
| workout_sets      | セット記録（統計クエリのため別テーブル） |

※ 統計機能（種目ごとのMAX重量、重量推移グラフ等）のため workout_sets は別テーブルとして維持。

---

### Phase 1: DBスキーマ変更

#### 1-1. テーブル名の変更

```prisma
model TrainingSession {
  id               String    @id @default(cuid())
  userId           String    @map("user_id")
  performedStartAt DateTime  @map("performed_start_at")
  performedEndAt   DateTime? @map("performed_end_at")
  place            String?
  deletedAt        DateTime? @map("deleted_at")
  createdAt        DateTime  @default(now()) @map("created_at")
  updatedAt        DateTime  @updatedAt @map("updated_at")

  user     User      @relation(fields: [userId], references: [id])
  workouts Workout[]

  @@map("training_sessions")
}

model Workout {
  id                String   @id @default(cuid())
  trainingSessionId String   @map("training_session_id")
  exerciseId        String   @map("exercise_id")
  orderIndex        Int      @map("order_index")
  note              String?
  createdAt         DateTime @default(now()) @map("created_at")
  updatedAt         DateTime @updatedAt @map("updated_at")

  trainingSession TrainingSession @relation(fields: [trainingSessionId], references: [id], onDelete: Cascade)
  exercise        Exercise        @relation(fields: [exerciseId], references: [id], onDelete: Restrict)
  workoutSets     WorkoutSet[]

  @@unique([trainingSessionId, exerciseId])
  @@unique([trainingSessionId, orderIndex])
  @@map("workouts")
}

model WorkoutSet {
  id        String   @id @default(cuid())
  workoutId String   @map("workout_id")
  // 筋トレ用
  weight    Int?
  reps      Int?
  // 有酸素用
  distance  Int?     // 距離（メートル）
  duration  Int?     // 時間（秒）
  speed     Decimal? // 速さ（km/h）
  calories  Int?     // カロリー（kcal）
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  workout Workout @relation(fields: [workoutId], references: [id], onDelete: Cascade)

  @@map("workout_sets")
}
```

#### 1-2. exercises テーブルの変更

有酸素運動を区別するため `exercise_type` フィールドを追加。

```prisma
model Exercise {
  // ...既存フィールド...
  exerciseType Int @default(0) @map("exercise_type") // 0: 筋トレ, 1: 有酸素
}
```

**ExerciseType Enum:**

| 値  | 名前     | 説明             |
| --- | -------- | ---------------- |
| 0   | strength | 筋力トレーニング |
| 1   | cardio   | 有酸素運動       |

---

### Phase 2: API設計

#### 2-1. TrainingSession API

| メソッド | パス                                   | 説明                                   |
| -------- | -------------------------------------- | -------------------------------------- |
| GET      | `/api/v1/training-sessions`            | 一覧取得（ページング）                 |
| GET      | `/api/v1/training-sessions/:sessionId` | 詳細取得（メタ情報＋ワークアウト一覧） |
| POST     | `/api/v1/training-sessions`            | 新規作成（日付のみ）                   |
| PUT      | `/api/v1/training-sessions/:sessionId` | メタ情報更新（場所、終了時刻）         |
| DELETE   | `/api/v1/training-sessions/:sessionId` | 削除                                   |

**GET `/api/v1/training-sessions/:sessionId` レスポンス例:**

```json
{
  "id": "cuid",
  "performedStartAt": "2024-01-15T10:00:00.000Z",
  "performedEndAt": "2024-01-15T11:30:00.000Z",
  "place": "ジム",
  "workouts": [
    {
      "id": "cuid",
      "orderIndex": 1,
      "note": "調子良かった",
      "exercise": {
        "id": "cuid",
        "name": "ベンチプレス",
        "bodyPart": 0,
        "exerciseType": 0
      },
      "sets": [
        { "id": "cuid", "weight": 60, "reps": 10 },
        { "id": "cuid", "weight": 70, "reps": 8 }
      ]
    }
  ]
}
```

#### 2-2. Workout API

| メソッド | パス                                                       | 説明                          |
| -------- | ---------------------------------------------------------- | ----------------------------- |
| POST     | `/api/v1/training-sessions/:sessionId/workouts`            | ワークアウト追加              |
| PUT      | `/api/v1/workouts/:workoutId`                              | 更新（メモ + セット差分更新） |
| DELETE   | `/api/v1/training-sessions/:sessionId/workouts/:workoutId` | ワークアウト削除              |
| PATCH    | `/api/v1/training-sessions/:sessionId/workouts/reorder`    | 並び替え                      |

**POST `/api/v1/training-sessions/:sessionId/workouts` - ワークアウト追加:**

- `exerciseId`: 追加する種目のID
- `orderIndex` はサーバー側で自動採番（末尾に追加）

```json
// リクエスト例
{
  "exerciseId": "cuid-of-exercise"
}
```

```json
// レスポンス例
{
  "id": "cuid",
  "orderIndex": 3,
  "note": null,
  "exercise": {
    "id": "cuid-of-exercise",
    "name": "ベンチプレス",
    "bodyPart": 0,
    "exerciseType": 0
  },
  "sets": []
}
```

**PUT `/api/v1/workouts/:workoutId` - メモ + セット差分更新:**

- `note`: ワークアウトのメモを更新
- `sets`: セットを差分更新
  - ID有り → 更新
  - ID無し → 新規作成
  - リクエストに無いID → 削除

```json
// リクエスト例
{
  "note": "調子良かった",
  "sets": [
    { "id": "existing-id-1", "weight": 60, "reps": 10 },
    { "id": "existing-id-2", "weight": 70, "reps": 8 },
    { "weight": 80, "reps": 5 }
  ]
}
```

#### 2-3. Exercise API

| メソッド | パス                            | 説明                         |
| -------- | ------------------------------- | ---------------------------- |
| GET      | `/api/v1/exercises`             | 一覧取得（exerciseType含む） |
| POST     | `/api/v1/exercises`             | カスタム種目作成             |
| PUT      | `/api/v1/exercises/:exerciseId` | カスタム種目更新             |
| DELETE   | `/api/v1/exercises/:exerciseId` | カスタム種目削除             |

---

### Phase 3: 実装順序

#### Step 1: DBマイグレーション

1. workouts → training_sessions にリネーム
2. workout_exercises → workouts にリネーム
3. workouts に note カラム追加
4. exercises に exercise_type カラム追加
5. workout_sets に有酸素用カラム追加
6. training_sessions から note カラム削除

#### Step 2: 型定義・バリデーション更新

1. ExerciseType enum 追加
2. Zodスキーマ更新
3. レスポンス型更新

#### Step 3: Service/Route 実装

1. TrainingSession API 実装
2. Workout API 実装（POST/PUT/DELETE/PATCH reorder）
3. WorkoutSet 差分更新 API 実装（PUT）
4. Exercise API の修正（exerciseType対応）

#### Step 4: テスト

1. 新規エンドポイントのテスト
2. 既存テストの修正
3. 統合テスト

---

### 削除する機能

- 旧 Workout API（`/api/v1/workouts`）→ TrainingSession API に置き換え
- training_sessions.note フィールド（ワークアウト単位に移行）

---

### 追加検討事項

1. **プリセット有酸素種目の追加**
   - ランニング、ウォーキング、サイクリング等をプリセットに追加

2. **履歴からの入力補助**
   - 前回のセット情報をコピーする機能（フロント側の機能だがAPI設計に影響する可能性）

3. **バリデーション**
   - 筋トレ種目には weight/reps のみ許可
   - 有酸素種目には distance/duration/speed/calories のみ許可

4. **統計API（将来）**
   - 種目ごとのMAX重量
   - 重量推移グラフ用データ

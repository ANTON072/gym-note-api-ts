# API エンドポイント一覧

## 概要

すべてのエンドポイントは Firebase Authentication による認証が必要です。
リクエストヘッダーに `Authorization: Bearer <Firebase ID Token>` を含めてください。

**ベースURL:** `/api/v1`

---

## Exercise（種目マスタ）

種目はプリセット種目（システム共通）とカスタム種目（ユーザー別）の2種類があります。

| 種別           | isPreset | 編集 | 削除 | 説明                         |
| -------------- | -------- | ---- | ---- | ---------------------------- |
| プリセット種目 | true     | 不可 | 不可 | システム提供の定番種目       |
| カスタム種目   | false    | 可   | 可   | ユーザーが独自に追加した種目 |

### exerciseType（種目タイプ）

| 値  | 名前     | 説明             |
| --- | -------- | ---------------- |
| 0   | strength | 筋力トレーニング |
| 1   | cardio   | 有酸素運動       |

### GET `/api/v1/exercises`

種目一覧を取得します。プリセット種目とログインユーザーのカスタム種目を返します。

#### レスポンス

```json
{
  "exercises": [
    {
      "id": "cuid",
      "name": "ベンチプレス",
      "bodyPart": 0,
      "exerciseType": 0,
      "isPreset": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": "cuid",
      "name": "ランニング",
      "bodyPart": null,
      "exerciseType": 1,
      "isPreset": false,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### POST `/api/v1/exercises`

新しいカスタム種目を登録します。

#### リクエスト

```json
{
  "name": "オリジナル種目",
  "bodyPart": 0,
  "exerciseType": 0
}
```

| フィールド   | 型     | 必須 | 説明                                                     |
| ------------ | ------ | ---- | -------------------------------------------------------- |
| name         | string | ○    | 種目名                                                   |
| bodyPart     | number | -    | 部位（0:胸, 1:背中, 2:肩, 3:腕, 4:脚, 5:体幹）           |
| exerciseType | number | -    | 種目タイプ（0:筋トレ, 1:有酸素）デフォルト: 0            |

#### レスポンス

```json
{
  "id": "cuid",
  "name": "オリジナル種目",
  "bodyPart": 0,
  "exerciseType": 0,
  "isPreset": false,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### PUT `/api/v1/exercises/:exerciseId`

カスタム種目を更新します。

**注意:** プリセット種目（isPreset: true）は更新できません（403 エラー）。

#### リクエスト

```json
{
  "name": "オリジナル種目（改）",
  "bodyPart": 0,
  "exerciseType": 0
}
```

#### レスポンス

```json
{
  "id": "cuid",
  "name": "オリジナル種目（改）",
  "bodyPart": 0,
  "exerciseType": 0,
  "isPreset": false,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

#### エラーレスポンス

| ステータス | 条件                 | メッセージ                     |
| ---------- | -------------------- | ------------------------------ |
| 403        | プリセット種目を編集 | プリセット種目は編集できません |
| 404        | 種目が存在しない     | 種目が見つかりません           |

### DELETE `/api/v1/exercises/:exerciseId`

カスタム種目を削除します（論理削除）。

**注意:** プリセット種目（isPreset: true）は削除できません（403 エラー）。

#### レスポンス

`204 No Content`（ボディなし）

#### エラーレスポンス

| ステータス | 条件                 | メッセージ                     |
| ---------- | -------------------- | ------------------------------ |
| 403        | プリセット種目を削除 | プリセット種目は削除できません |
| 404        | 種目が存在しない     | 種目が見つかりません           |

---

## TrainingSession（トレーニングセッション）

1日のトレーニング全体を管理します。日付、場所、開始・終了時刻を保持し、複数のワークアウトを含みます。

### GET `/api/v1/training-sessions`

ログインユーザーのトレーニングセッション一覧を取得します。ワークアウトとセットも含みます。

#### クエリパラメータ

| パラメータ | 型     | 説明                                |
| ---------- | ------ | ----------------------------------- |
| offset     | number | 取得を開始する位置（デフォルト: 0） |

#### レスポンス

```json
{
  "trainingSessions": [
    {
      "id": "cuid",
      "performedStartAt": "2024-01-15T10:00:00.000Z",
      "performedEndAt": "2024-01-15T11:30:00.000Z",
      "place": "ジム",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z",
      "workouts": [
        {
          "id": "cuid",
          "orderIndex": 1,
          "note": "調子良かった",
          "exercise": {
            "id": "cuid",
            "name": "ベンチプレス",
            "bodyPart": 0,
            "exerciseType": 0,
            "isPreset": true
          },
          "sets": [
            { "id": "cuid", "weight": 60000, "reps": 10, "distance": null, "duration": null, "speed": null, "calories": null },
            { "id": "cuid", "weight": 70000, "reps": 8, "distance": null, "duration": null, "speed": null, "calories": null }
          ]
        }
      ]
    }
  ],
  "paging": {
    "total": 100,
    "offset": 0,
    "limit": 20
  }
}
```

### GET `/api/v1/training-sessions/:sessionId`

特定のトレーニングセッション詳細を取得します。

#### レスポンス

```json
{
  "id": "cuid",
  "performedStartAt": "2024-01-15T10:00:00.000Z",
  "performedEndAt": "2024-01-15T11:30:00.000Z",
  "place": "ジム",
  "createdAt": "2024-01-15T12:00:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z",
  "workouts": [
    {
      "id": "cuid",
      "orderIndex": 1,
      "note": "調子良かった",
      "exercise": {
        "id": "cuid",
        "name": "ベンチプレス",
        "bodyPart": 0,
        "exerciseType": 0,
        "isPreset": true
      },
      "workoutSets": [
        { "id": "cuid", "weight": 60, "reps": 10 },
        { "id": "cuid", "weight": 70, "reps": 8 }
      ]
    }
  ]
}
```

### POST `/api/v1/training-sessions`

新しいトレーニングセッションを作成します。

#### リクエスト

```json
{
  "performedStartAt": "2024-01-15T10:00:00.000Z",
  "performedEndAt": "2024-01-15T11:30:00.000Z",
  "place": "ジム"
}
```

| フィールド       | 型               | 必須 | 説明     |
| ---------------- | ---------------- | ---- | -------- |
| performedStartAt | string (ISO8601) | ○    | 開始日時 |
| performedEndAt   | string (ISO8601) | -    | 終了日時 |
| place            | string           | -    | 場所     |

#### レスポンス

```json
{
  "id": "cuid",
  "performedStartAt": "2024-01-15T10:00:00.000Z",
  "performedEndAt": "2024-01-15T11:30:00.000Z",
  "place": "ジム",
  "createdAt": "2024-01-15T12:00:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z",
  "workouts": []
}
```

### PUT `/api/v1/training-sessions/:sessionId`

トレーニングセッションのメタ情報を更新します。

#### リクエスト

```json
{
  "performedStartAt": "2024-01-15T10:00:00.000Z",
  "performedEndAt": "2024-01-15T12:00:00.000Z",
  "place": "ジム（更新）"
}
```

#### レスポンス

```json
{
  "id": "cuid",
  "performedStartAt": "2024-01-15T10:00:00.000Z",
  "performedEndAt": "2024-01-15T12:00:00.000Z",
  "place": "ジム（更新）",
  "createdAt": "2024-01-15T12:00:00.000Z",
  "updatedAt": "2024-01-15T13:00:00.000Z",
  "workouts": [
    {
      "id": "cuid",
      "orderIndex": 1,
      "note": "調子良かった",
      "exercise": {
        "id": "cuid",
        "name": "ベンチプレス",
        "bodyPart": 0,
        "exerciseType": 0,
        "isPreset": true
      },
      "workoutSets": [
        { "id": "cuid", "weight": 60, "reps": 10 },
        { "id": "cuid", "weight": 70, "reps": 8 }
      ]
    }
  ]
}
```

### DELETE `/api/v1/training-sessions/:sessionId`

トレーニングセッションを削除します（論理削除）。

#### レスポンス

`204 No Content`（ボディなし）

---

## Workout（ワークアウト）

トレーニングセッション内の1つの種目の実施記録です。種目、セット群、メモを保持します。

### POST `/api/v1/training-sessions/:sessionId/workouts`

トレーニングセッションにワークアウトを追加します。orderIndex はサーバー側で自動採番されます。

#### リクエスト

```json
{
  "exerciseId": "cuid-of-exercise"
}
```

| フィールド | 型     | 必須 | 説明       |
| ---------- | ------ | ---- | ---------- |
| exerciseId | string | ○    | 種目のID   |

#### レスポンス

```json
{
  "id": "cuid",
  "orderIndex": 3,
  "note": null,
  "exercise": {
    "id": "cuid-of-exercise",
    "name": "ベンチプレス",
    "bodyPart": 0,
    "exerciseType": 0,
    "isPreset": true
  },
  "workoutSets": []
}
```

### PUT `/api/v1/workouts/:workoutId`

ワークアウトのメモとセットを差分更新します。

#### セットの差分更新ルール

- `sets[].id` 有り → 更新
- `sets[].id` 無し → 新規作成
- リクエストに無いID → 削除

#### リクエスト（筋トレの場合）

```json
{
  "note": "調子良かった",
  "sets": [
    { "id": "existing-id-1", "weight": 60000, "reps": 10 },
    { "id": "existing-id-2", "weight": 70000, "reps": 8 },
    { "weight": 80000, "reps": 5 }
  ]
}
```

#### リクエスト（有酸素の場合）

```json
{
  "note": "いいペースで走れた",
  "sets": [
    {
      "distance": 5000,
      "duration": 1800,
      "speed": 105,
      "calories": 350
    }
  ]
}
```

| フィールド     | 型     | 必須 | 説明                                         |
| -------------- | ------ | ---- | -------------------------------------------- |
| note           | string | -    | メモ                                         |
| sets           | array  | -    | セット一覧                                   |
| sets[].id      | string | -    | 既存セットのID                               |
| sets[].weight  | number | -    | 重量（グラム）筋トレ用 - フロント側でkgに変換 |
| sets[].reps    | number | -    | 回数 筋トレ用                                |
| sets[].distance| number | -    | 距離（m）有酸素用                            |
| sets[].duration| number | -    | 時間（秒）有酸素用                           |
| sets[].speed   | number | -    | 速さ（0.1 km/h 単位）有酸素用 - 例: 10.5km/h → 105 |
| sets[].calories| number | -    | カロリー（kcal）有酸素用                     |

#### レスポンス（筋トレの場合）

```json
{
  "id": "cuid",
  "orderIndex": 1,
  "note": "調子良かった",
  "exercise": {
    "id": "cuid",
    "name": "ベンチプレス",
    "bodyPart": 0,
    "exerciseType": 0,
    "isPreset": true
  },
  "sets": [
    { "id": "existing-id-1", "weight": 60000, "reps": 10, "distance": null, "duration": null, "speed": null, "calories": null },
    { "id": "existing-id-2", "weight": 70000, "reps": 8, "distance": null, "duration": null, "speed": null, "calories": null },
    { "id": "new-id", "weight": 80000, "reps": 5, "distance": null, "duration": null, "speed": null, "calories": null }
  ]
}
```

#### レスポンス（有酸素の場合）

```json
{
  "id": "cuid",
  "orderIndex": 2,
  "note": "いいペースで走れた",
  "exercise": {
    "id": "cuid",
    "name": "ランニング",
    "bodyPart": null,
    "exerciseType": 1,
    "isPreset": false
  },
  "sets": [
    {
      "id": "cuid",
      "weight": null,
      "reps": null,
      "distance": 5000,
      "duration": 1800,
      "speed": 105,
      "calories": 350
    }
  ]
}
```

### DELETE `/api/v1/training-sessions/:sessionId/workouts/:workoutId`

ワークアウトを削除します。

#### レスポンス

`204 No Content`（ボディなし）

### PATCH `/api/v1/training-sessions/:sessionId/workouts/reorder`

ワークアウトの並び順を変更します。

#### リクエスト

```json
{
  "workoutIds": ["workout-id-1", "workout-id-2", "workout-id-3"]
}
```

| フィールド | 型       | 必須 | 説明                               |
| ---------- | -------- | ---- | ---------------------------------- |
| workoutIds | string[] | ○    | 新しい順序でのワークアウトIDの配列 |

#### レスポンス

```json
{
  "workouts": [
    {
      "id": "workout-id-1",
      "orderIndex": 1,
      "note": null,
      "exercise": {
        "id": "cuid",
        "name": "スクワット",
        "bodyPart": 4,
        "exerciseType": 0,
        "isPreset": true
      },
      "sets": [
        { "id": "cuid", "weight": 80000, "reps": 10, "distance": null, "duration": null, "speed": null, "calories": null }
      ]
    },
    {
      "id": "workout-id-2",
      "orderIndex": 2,
      "note": null,
      "exercise": {
        "id": "cuid",
        "name": "ベンチプレス",
        "bodyPart": 0,
        "exerciseType": 0,
        "isPreset": true
      },
      "sets": [
        { "id": "cuid", "weight": 60000, "reps": 10, "distance": null, "duration": null, "speed": null, "calories": null }
      ]
    },
    {
      "id": "workout-id-3",
      "orderIndex": 3,
      "note": null,
      "exercise": {
        "id": "cuid",
        "name": "デッドリフト",
        "bodyPart": 1,
        "exerciseType": 0,
        "isPreset": true
      },
      "sets": []
    }
  ]
}
```

---

## 共通仕様

エラーレスポンスおよびページングの仕様については [CLAUDE.md](../CLAUDE.md) の「API レスポンス規約」を参照してください。

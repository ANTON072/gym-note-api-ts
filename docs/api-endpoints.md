# API エンドポイント一覧

## 概要

すべてのエンドポイントは Firebase Authentication による認証が必要です。
リクエストヘッダーに `Authorization: Bearer <Firebase ID Token>` を含めてください。

**ベースURL:** `/api/v1`

---

## Exercise（種目マスタ）

種目はプリセット種目（システム共通）とカスタム種目（ユーザー別）の2種類があります。

| 種別           | isPreset | 編集 | 削除 | 説明                       |
| -------------- | -------- | ---- | ---- | -------------------------- |
| プリセット種目 | true     | 不可 | 不可 | システム提供の定番種目     |
| カスタム種目   | false    | 可   | 可   | ユーザーが独自に追加した種目 |

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
      "isPreset": true,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": "cuid",
      "name": "オリジナル種目",
      "bodyPart": 0,
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
  "bodyPart": 0
}
```

| フィールド | 型     | 必須 | 説明                                           |
| ---------- | ------ | ---- | ---------------------------------------------- |
| name       | string | ○    | 種目名                                         |
| bodyPart   | number | -    | 部位（0:胸, 1:背中, 2:肩, 3:腕, 4:脚, 5:体幹） |

#### レスポンス

```json
{
  "id": "cuid",
  "name": "オリジナル種目",
  "bodyPart": 0,
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
  "bodyPart": 0
}
```

#### レスポンス

```json
{
  "id": "cuid",
  "name": "オリジナル種目（改）",
  "bodyPart": 0,
  "isPreset": false,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

#### エラーレスポンス

| ステータス | 条件                   | メッセージ                       |
| ---------- | ---------------------- | -------------------------------- |
| 403        | プリセット種目を編集   | プリセット種目は編集できません   |
| 404        | 種目が存在しない       | 種目が見つかりません             |

### DELETE `/api/v1/exercises/:exerciseId`

カスタム種目を削除します（論理削除）。

**注意:** プリセット種目（isPreset: true）は削除できません（403 エラー）。

#### レスポンス

`204 No Content`（ボディなし）

#### エラーレスポンス

| ステータス | 条件                   | メッセージ                       |
| ---------- | ---------------------- | -------------------------------- |
| 403        | プリセット種目を削除   | プリセット種目は削除できません   |
| 404        | 種目が存在しない       | 種目が見つかりません             |

---

## Workout（トレーニング記録）

### GET `/api/v1/workouts`

ログインユーザーのトレーニング一覧を取得します。WorkoutExercises と WorkoutSets を含みます。

#### クエリパラメータ

| パラメータ | 型     | 説明                                |
| ---------- | ------ | ----------------------------------- |
| offset     | number | 取得を開始する位置（デフォルト: 0） |

#### レスポンス

```json
{
  "workouts": [
    {
      "id": "cuid",
      "performedStartAt": "2024-01-15T10:00:00.000Z",
      "performedEndAt": "2024-01-15T11:30:00.000Z",
      "place": "ジム",
      "note": "調子良かった",
      "createdAt": "2024-01-15T12:00:00.000Z",
      "updatedAt": "2024-01-15T12:00:00.000Z",
      "workoutExercises": [
        {
          "id": "cuid",
          "orderIndex": 1,
          "exercise": {
            "id": "cuid",
            "name": "ベンチプレス",
            "bodyPart": 0,
            "isPreset": true
          },
          "workoutSets": [
            {
              "id": "cuid",
              "weight": 60,
              "reps": 10
            },
            {
              "id": "cuid",
              "weight": 70,
              "reps": 8
            }
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

### GET `/api/v1/workouts/:workoutId`

特定のトレーニング詳細を取得します。

#### レスポンス

```json
{
  "id": "cuid",
  "performedStartAt": "2024-01-15T10:00:00.000Z",
  "performedEndAt": "2024-01-15T11:30:00.000Z",
  "place": "ジム",
  "note": "調子良かった",
  "createdAt": "2024-01-15T12:00:00.000Z",
  "updatedAt": "2024-01-15T12:00:00.000Z",
  "workoutExercises": [
    {
      "id": "cuid",
      "orderIndex": 1,
      "exercise": {
        "id": "cuid",
        "name": "ベンチプレス",
        "bodyPart": 0
      },
      "workoutSets": [
        {
          "id": "cuid",
          "weight": 60,
          "reps": 10
        },
        {
          "id": "cuid",
          "weight": 70,
          "reps": 8
        }
      ]
    }
  ]
}
```

### POST `/api/v1/workouts`

新しいトレーニングを登録します。WorkoutExercises と WorkoutSets も同時に登録します。

#### リクエスト

**既存エクササイズを使用する場合:**

```json
{
  "performedStartAt": "2024-01-15T10:00:00.000Z",
  "performedEndAt": "2024-01-15T11:30:00.000Z",
  "place": "ジム",
  "note": "調子良かった",
  "workoutExercises": [
    {
      "exercise": { "id": "cuid" },
      "orderIndex": 1,
      "workoutSets": [
        { "weight": 60, "reps": 10 },
        { "weight": 70, "reps": 8 }
      ]
    }
  ]
}
```

**新規エクササイズを作成する場合:**

```json
{
  "performedStartAt": "2024-01-15T10:00:00.000Z",
  "performedEndAt": null,
  "place": "自宅",
  "note": null,
  "workoutExercises": [
    {
      "exercise": { "name": "懸垂", "bodyPart": 1 },
      "orderIndex": 1,
      "workoutSets": [{ "weight": null, "reps": 10 }]
    }
  ]
}
```

| フィールド                              | 型               | 必須 | 説明                       |
| --------------------------------------- | ---------------- | ---- | -------------------------- |
| performedStartAt                        | string (ISO8601) | ○    | 開始日時                   |
| performedEndAt                          | string (ISO8601) | -    | 終了日時                   |
| place                                   | string           | -    | 場所                       |
| note                                    | string           | -    | メモ                       |
| workoutExercises                        | array            | -    | 実施した種目一覧           |
| workoutExercises[].exercise             | object           | ○    | 種目指定（下記のいずれか） |
| workoutExercises[].exercise.id          | string           | -    | 既存種目のID               |
| workoutExercises[].exercise.name        | string           | -    | 新規種目の名前             |
| workoutExercises[].exercise.bodyPart    | number           | -    | 新規種目の部位             |
| workoutExercises[].orderIndex           | number           | ○    | 表示順                     |
| workoutExercises[].workoutSets          | array            | -    | セット一覧                 |
| workoutExercises[].workoutSets[].weight | number           | -    | 重量（kg）                 |
| workoutExercises[].workoutSets[].reps   | number           | -    | 回数                       |

#### レスポンス

登録されたワークアウトデータ（GET `/api/v1/workouts/:workoutId` と同じ形式）

### PUT `/api/v1/workouts/:workoutId`

トレーニングを更新します。WorkoutExercises と WorkoutSets は削除して再作成されます。

#### リクエスト

POST と同じ形式

#### レスポンス

更新されたワークアウトデータ（GET `/api/v1/workouts/:workoutId` と同じ形式）

### DELETE `/api/v1/workouts/:workoutId`

トレーニングを削除します（論理削除）。

#### レスポンス

`204 No Content`（ボディなし）

---

## 共通仕様

エラーレスポンスおよびページングの仕様については [CLAUDE.md](../CLAUDE.md) の「API レスポンス規約」を参照してください。

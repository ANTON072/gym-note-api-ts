# API エンドポイント一覧

## 概要

すべてのエンドポイントは Firebase Authentication による認証が必要です。
リクエストヘッダーに `Authorization: Bearer <Firebase ID Token>` を含めてください。

**ベースURL:** `/api/v1`

---

## User

### GET `/api/v1/user`

現在のユーザー情報を取得します。初回アクセス時は Firebase の情報を元にユーザーを自動登録します。

#### レスポンス

```json
{
  "id": "cuid",
  "firebaseUid": "firebase_uid",
  "email": "user@example.com",
  "name": "ユーザー名",
  "imageUrl": "https://example.com/image.jpg",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

---

## Exercise（種目マスタ）

### GET `/api/v1/exercises`

ログインユーザーの種目一覧を取得します。

#### レスポンス

```json
{
  "exercises": [
    {
      "id": "cuid",
      "name": "ベンチプレス",
      "bodyPart": 0,
      "laterality": 0,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

### POST `/api/v1/exercises`

新しい種目を登録します。

#### リクエスト

```json
{
  "name": "ベンチプレス",
  "bodyPart": 0,
  "laterality": 0
}
```

| フィールド | 型     | 必須 | 説明                                           |
| ---------- | ------ | ---- | ---------------------------------------------- |
| name       | string | ○    | 種目名                                         |
| bodyPart   | number | -    | 部位（0:胸, 1:背中, 2:肩, 3:腕, 4:脚, 5:体幹） |
| laterality | number | -    | 左右区分（0:両側, 1:片側）                     |

#### レスポンス

```json
{
  "id": "cuid",
  "name": "ベンチプレス",
  "bodyPart": 0,
  "laterality": 0,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T10:00:00.000Z"
}
```

### PUT `/api/v1/exercises/:exerciseId`

種目を更新します。

#### リクエスト

```json
{
  "name": "ベンチプレス（ワイド）",
  "bodyPart": 0,
  "laterality": 0
}
```

#### レスポンス

```json
{
  "id": "cuid",
  "name": "ベンチプレス（ワイド）",
  "bodyPart": 0,
  "laterality": 0,
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

### DELETE `/api/v1/exercises/:exerciseId`

種目を削除します。

#### レスポンス

```json
{
  "message": "削除しました"
}
```

---

## Workout（トレーニング記録）

### GET `/api/v1/workouts`

ログインユーザーのトレーニング一覧を取得します。WorkoutExercises と WorkoutSets を含みます。

#### クエリパラメータ

| パラメータ | 型     | 説明                                    |
| ---------- | ------ | --------------------------------------- |
| offset     | number | 取得を開始する位置（デフォルト: 0）     |

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
            "laterality": 0
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
        "bodyPart": 0,
        "laterality": 0
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

```json
{
  "performedStartAt": "2024-01-15T10:00:00.000Z",
  "performedEndAt": "2024-01-15T11:30:00.000Z",
  "place": "ジム",
  "note": "調子良かった",
  "workoutExercises": [
    {
      "exerciseId": "cuid",
      "orderIndex": 1,
      "workoutSets": [
        { "weight": 60, "reps": 10 },
        { "weight": 70, "reps": 8 }
      ]
    }
  ]
}
```

| フィールド                              | 型               | 必須 | 説明             |
| --------------------------------------- | ---------------- | ---- | ---------------- |
| performedStartAt                        | string (ISO8601) | ○    | 開始日時         |
| performedEndAt                          | string (ISO8601) | -    | 終了日時         |
| place                                   | string           | -    | 場所             |
| note                                    | string           | -    | メモ             |
| workoutExercises                        | array            | -    | 実施した種目一覧 |
| workoutExercises[].exerciseId           | string           | ○    | 種目ID           |
| workoutExercises[].orderIndex           | number           | ○    | 表示順           |
| workoutExercises[].workoutSets          | array            | -    | セット一覧       |
| workoutExercises[].workoutSets[].weight | number           | -    | 重量（kg）       |
| workoutExercises[].workoutSets[].reps   | number           | -    | 回数             |

#### レスポンス

登録されたワークアウトデータ（GET `/api/v1/workouts/:workoutId` と同じ形式）

### PUT `/api/v1/workouts/:workoutId`

トレーニングを更新します。WorkoutExercises と WorkoutSets は削除して再作成されます。

#### リクエスト

POST と同じ形式

#### レスポンス

更新されたワークアウトデータ（GET `/api/v1/workouts/:workoutId` と同じ形式）

### DELETE `/api/v1/workouts/:workoutId`

トレーニングを削除します。関連する WorkoutExercises と WorkoutSets も削除されます。

#### レスポンス

```json
{
  "message": "削除しました"
}
```

---

## 共通仕様

エラーレスポンスおよびページングの仕様については [CLAUDE.md](../CLAUDE.md) の「API レスポンス規約」を参照してください。

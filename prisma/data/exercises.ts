/**
 * プリセット種目のシードデータ
 * 全ユーザー共通で使用できる定番種目
 */
import { BodyPart } from "../../src/types/exercise";

export const presetExerciseSeeds = [
  // 胸
  { name: "ベンチプレス", bodyPart: BodyPart.CHEST },
  { name: "インクラインベンチプレス", bodyPart: BodyPart.CHEST },
  { name: "ダンベルフライ", bodyPart: BodyPart.CHEST },
  { name: "ケーブルクロスオーバー", bodyPart: BodyPart.CHEST },
  { name: "チェストプレス", bodyPart: BodyPart.CHEST },

  // 背中
  { name: "デッドリフト", bodyPart: BodyPart.BACK },
  { name: "ラットプルダウン", bodyPart: BodyPart.BACK },
  { name: "ベントオーバーロウ", bodyPart: BodyPart.BACK },
  { name: "シーテッドロウ", bodyPart: BodyPart.BACK },
  { name: "懸垂", bodyPart: BodyPart.BACK },

  // 肩
  { name: "ショルダープレス", bodyPart: BodyPart.SHOULDERS },
  { name: "サイドレイズ", bodyPart: BodyPart.SHOULDERS },
  { name: "フロントレイズ", bodyPart: BodyPart.SHOULDERS },
  { name: "リアデルトフライ", bodyPart: BodyPart.SHOULDERS },
  { name: "アーノルドプレス", bodyPart: BodyPart.SHOULDERS },

  // 腕
  { name: "バーベルカール", bodyPart: BodyPart.ARMS },
  { name: "ダンベルカール", bodyPart: BodyPart.ARMS },
  { name: "ハンマーカール", bodyPart: BodyPart.ARMS },
  { name: "トライセプスプッシュダウン", bodyPart: BodyPart.ARMS },
  { name: "スカルクラッシャー", bodyPart: BodyPart.ARMS },

  // 脚
  { name: "スクワット", bodyPart: BodyPart.LEGS },
  { name: "レッグプレス", bodyPart: BodyPart.LEGS },
  { name: "レッグエクステンション", bodyPart: BodyPart.LEGS },
  { name: "レッグカール", bodyPart: BodyPart.LEGS },
  { name: "カーフレイズ", bodyPart: BodyPart.LEGS },
  { name: "ブルガリアンスクワット", bodyPart: BodyPart.LEGS },

  // 体幹
  { name: "プランク", bodyPart: BodyPart.CORE },
  { name: "アブローラー", bodyPart: BodyPart.CORE },
  { name: "ケーブルクランチ", bodyPart: BodyPart.CORE },
  { name: "ハンギングレッグレイズ", bodyPart: BodyPart.CORE },
];

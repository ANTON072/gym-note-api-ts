/**
 * プリセット種目のシードデータ
 * 全ユーザー共通で使用できる定番種目
 */
import { BodyPart, Laterality } from "../../src/types/exercise";

export const presetExerciseSeeds = [
  // 胸
  { name: "ベンチプレス", bodyPart: BodyPart.CHEST, laterality: Laterality.BILATERAL },
  { name: "インクラインベンチプレス", bodyPart: BodyPart.CHEST, laterality: Laterality.BILATERAL },
  { name: "ダンベルフライ", bodyPart: BodyPart.CHEST, laterality: Laterality.BILATERAL },
  { name: "ケーブルクロスオーバー", bodyPart: BodyPart.CHEST, laterality: Laterality.BILATERAL },
  { name: "チェストプレス", bodyPart: BodyPart.CHEST, laterality: Laterality.BILATERAL },

  // 背中
  { name: "デッドリフト", bodyPart: BodyPart.BACK, laterality: Laterality.BILATERAL },
  { name: "ラットプルダウン", bodyPart: BodyPart.BACK, laterality: Laterality.BILATERAL },
  { name: "ベントオーバーロウ", bodyPart: BodyPart.BACK, laterality: Laterality.BILATERAL },
  { name: "シーテッドロウ", bodyPart: BodyPart.BACK, laterality: Laterality.BILATERAL },
  { name: "懸垂", bodyPart: BodyPart.BACK, laterality: Laterality.BILATERAL },

  // 肩
  { name: "ショルダープレス", bodyPart: BodyPart.SHOULDERS, laterality: Laterality.BILATERAL },
  { name: "サイドレイズ", bodyPart: BodyPart.SHOULDERS, laterality: Laterality.BILATERAL },
  { name: "フロントレイズ", bodyPart: BodyPart.SHOULDERS, laterality: Laterality.BILATERAL },
  { name: "リアデルトフライ", bodyPart: BodyPart.SHOULDERS, laterality: Laterality.BILATERAL },
  { name: "アーノルドプレス", bodyPart: BodyPart.SHOULDERS, laterality: Laterality.BILATERAL },

  // 腕
  { name: "バーベルカール", bodyPart: BodyPart.ARMS, laterality: Laterality.BILATERAL },
  { name: "ダンベルカール", bodyPart: BodyPart.ARMS, laterality: Laterality.UNILATERAL },
  { name: "ハンマーカール", bodyPart: BodyPart.ARMS, laterality: Laterality.UNILATERAL },
  { name: "トライセプスプッシュダウン", bodyPart: BodyPart.ARMS, laterality: Laterality.BILATERAL },
  { name: "スカルクラッシャー", bodyPart: BodyPart.ARMS, laterality: Laterality.BILATERAL },

  // 脚
  { name: "スクワット", bodyPart: BodyPart.LEGS, laterality: Laterality.BILATERAL },
  { name: "レッグプレス", bodyPart: BodyPart.LEGS, laterality: Laterality.BILATERAL },
  { name: "レッグエクステンション", bodyPart: BodyPart.LEGS, laterality: Laterality.BILATERAL },
  { name: "レッグカール", bodyPart: BodyPart.LEGS, laterality: Laterality.BILATERAL },
  { name: "カーフレイズ", bodyPart: BodyPart.LEGS, laterality: Laterality.BILATERAL },
  { name: "ブルガリアンスクワット", bodyPart: BodyPart.LEGS, laterality: Laterality.UNILATERAL },

  // 体幹
  { name: "プランク", bodyPart: BodyPart.CORE, laterality: Laterality.BILATERAL },
  { name: "アブローラー", bodyPart: BodyPart.CORE, laterality: Laterality.BILATERAL },
  { name: "ケーブルクランチ", bodyPart: BodyPart.CORE, laterality: Laterality.BILATERAL },
  { name: "ハンギングレッグレイズ", bodyPart: BodyPart.CORE, laterality: Laterality.BILATERAL },
];

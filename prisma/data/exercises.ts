/**
 * プリセット種目のシードデータ
 * 全ユーザー共通で使用できる定番種目
 */
import { BodyPart } from "../../src/types/exercise";

export const presetExerciseSeeds = [
  // 胸
  { name: "ベンチプレス", bodyPart: BodyPart.CHEST },
  { name: "インクラインベンチプレス", bodyPart: BodyPart.CHEST },
  { name: "ダンベルベンチプレス", bodyPart: BodyPart.CHEST },
  { name: "ダンベルインクラインベンチプレス", bodyPart: BodyPart.CHEST },
  { name: "ダンベルフライ", bodyPart: BodyPart.CHEST },
  { name: "スミスマシンベンチプレス", bodyPart: BodyPart.CHEST },
  { name: "スミスマシンインクラインベンチプレス", bodyPart: BodyPart.CHEST },

  // 背中
  { name: "デッドリフト", bodyPart: BodyPart.BACK },
  { name: "ラットプルダウン", bodyPart: BodyPart.BACK },
  { name: "ベントオーバーロウ", bodyPart: BodyPart.BACK },
  { name: "シーテッドロウ", bodyPart: BodyPart.BACK },
  { name: "チンニング", bodyPart: BodyPart.BACK },
  { name: "アシストチンニング", bodyPart: BodyPart.BACK },
  { name: "ワンハンドダンベルロウ", bodyPart: BodyPart.BACK },

  // 肩
  { name: "スタンディングミリタリープレス", bodyPart: BodyPart.SHOULDERS },
  { name: "シーテッドミリタリープレス", bodyPart: BodyPart.SHOULDERS },
  { name: "スミスマシンショルダープレス", bodyPart: BodyPart.SHOULDERS },
  { name: "ダンベルショルダープレス", bodyPart: BodyPart.SHOULDERS },
  { name: "ダンベルサイドレイズ", bodyPart: BodyPart.SHOULDERS },
  { name: "ダンベルインクラインサイドレイズ", bodyPart: BodyPart.SHOULDERS },
  { name: "ダンベルリアレイズ", bodyPart: BodyPart.SHOULDERS },

  // 腕
  { name: "バーベルアームカール", bodyPart: BodyPart.ARMS },
  { name: "ダンベルアームカール", bodyPart: BodyPart.ARMS },
  { name: "ハンマーカール", bodyPart: BodyPart.ARMS },
  { name: "スカルクラッシャー", bodyPart: BodyPart.ARMS },

  // 脚
  { name: "スクワット", bodyPart: BodyPart.LEGS },
  { name: "レッグプレス", bodyPart: BodyPart.LEGS },
  { name: "レッグエクステンション", bodyPart: BodyPart.LEGS },
  { name: "レッグカール", bodyPart: BodyPart.LEGS },
  { name: "カーフレイズ", bodyPart: BodyPart.LEGS },
  { name: "ブルガリアンスクワット", bodyPart: BodyPart.LEGS },
  { name: "ルーマニアンデッドリフト", bodyPart: BodyPart.LEGS },

  // 体幹
  { name: "クランチ", bodyPart: BodyPart.CORE },
  { name: "レッグレイズ", bodyPart: BodyPart.CORE },
];

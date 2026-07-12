import { defineConfig } from '@yukyu30/fluorite'

/**
 * yukyu.net の記事 frontmatter 規約。
 *
 * 実体としての検証は 2 層に分かれている:
 * - ビルド時の型付け・パース … src/lib/frontmatter.ts の zod スキーマ
 *   （frontmatter を型付きで読み込むため）
 * - 編集規約(エディトリアル)のリント … 本ファイル + fluorite CLI
 *   （許可タグ・著者・日付形式・任意項目の形式など、記事を書く人向けのルール）
 *
 * fluorite はクォート無しの YAML 日付（`date: 2024-01-01`）も文字列のまま保持するので、
 * isoDate() で書かれたままの `YYYY-MM-DD` 形式を直接検証できる。
 */

/** 記事に付けてよいタグ（カテゴリ）の正規セット。新規タグはここに追加して合意を取る。 */
export const CANONICAL_TAGS = [
  '日記',
  'つくったもの',
  'おでかけ',
  '振り返り',
  '買ったもの',
  'work',
  'イベント',
  'Advent Calendar',
  '読書',
  '展示会',
  '誕生日',
  '登壇',
  '目標',
  'お知らせ'
]

/** author / coAuthors に書いてよい著者の許可リスト。 */
export const AUTHORS = ['yukyu', 'claude-opus-4-7', 'gpt-5-6-terra']

export default defineConfig({
  include: ['content/posts/**/*.mdx'],
  // me はブログ記事ではなくプロフィールページなので、タグ必須などの編集規約からは除外する。
  exclude: ['content/posts/me/**'],
  rules: fm => {
    // --- 必須項目 ---
    fm.key('title').required().type('string').lengthMin(1)
    // date は YYYY-MM-DD 形式まで検証（2026-2-3 や 2026-02-30 のような不正値も弾く）
    fm.key('date').required().isoDate()
    fm.key('author').required().oneOf(AUTHORS)
    fm.key('tag').required().type('array').lengthMin(1).subsetOf(CANONICAL_TAGS)
    fm.key('tag').each.type('string')

    // --- 任意項目（存在するときだけ検証する） ---
    if (fm.data.description !== undefined) {
      fm.key('description').type('string').lengthMin(1)
    }
    if (fm.data.thumbnail !== undefined) {
      // 例: /posts/{slug}/cover.jpeg のような絶対パス
      fm.key('thumbnail').type('string').matches(/^\/.+/)
    }
    if (fm.data.coAuthors !== undefined) {
      fm.key('coAuthors').type('array')
      fm.key('coAuthors').each.oneOf(AUTHORS)
    }
  }
})

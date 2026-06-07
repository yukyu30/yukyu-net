import { defineConfig } from '@yukyu30/fluorite'

/**
 * yukyu.net の記事 frontmatter 規約。
 *
 * 実体としての検証は 2 層に分かれている:
 * - ビルド時の型付け・パース … src/lib/frontmatter.ts の zod スキーマ
 *   （date の YYYY-MM-DD 形式などはここで担保される）
 * - 編集規約(エディトリアル)のリント … 本ファイル + fluorite CLI
 *   （許可タグ・著者・任意項目の形式など、記事を書く人向けのルール）
 *
 * 注意: YAML はクォート無しの `date: 2024-01-01` を Date 型としてパースするため、
 * fluorite では date の「存在」のみ検証し、形式は zod 側に委ねている。
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
export const AUTHORS = ['yukyu', 'claude-opus-4-7']

export default defineConfig({
  include: ['content/posts/**/*.mdx'],
  // me はブログ記事ではなくプロフィールページなので、タグ必須などの編集規約からは除外する。
  exclude: ['content/posts/me/**'],
  rules: fm => {
    // --- 必須項目 ---
    fm.key('title').required().type('string').lengthMin(1)
    // date は存在のみ検証（形式 YYYY-MM-DD は zod が build 時に担保）
    fm.key('date').required()
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

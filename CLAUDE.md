# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

yukyu.net を管理する Next.js 15 + Nextra v4 製の個人ブログ。MDX で記事を管理する。

## コマンド

```bash
# 開発サーバー
npm run dev

# ビルド
npm run build

# テスト
npm run test

# 単一テストファイル
npm run test -- src/lib/posts.test.ts

# テストウォッチ
npm run test:watch

# 旧 v2 の Markdown 記事を MDX に変換するスクリプト（必要時のみ）
npm run convert:posts

# 型チェック
npm run typecheck

# Lint
npm run lint

# frontmatter の規約チェック（fluorite）
npm run lint:frontmatter

# 本文の textlint
npm run textlint
```

## アーキテクチャ

### 記事管理
- 記事と画像は `content/posts/{slug}/` にまとめて格納
  - 本文: `content/posts/{slug}/index.mdx`
  - 画像: 同じディレクトリに置く（例 `content/posts/{slug}/cover.jpeg`）
- MDX 本文の画像参照は相対パス `![](./cover.jpeg)` を使う（Nextra が `next/image` 最適化）
- frontmatter `thumbnail` は URL 形式 `/posts/{slug}/cover.jpeg`
  - `src/app/posts/[slug]/[file]/route.ts`（`force-static` + `dynamicParams: false`）が `content/posts/{slug}/{file}` を直接配信。`generateStaticParams` で全画像を列挙してビルド時に静的化される
  - `next.config.mjs` の `outputFileTracingExcludes` で画像をサーバーバンドルから除外
- `src/lib/posts.ts` が記事の読み込み・キャッシュ・タグ集計を担当
- frontmatter のスキーマは `src/lib/frontmatter.ts` で zod 定義

### frontmatter 規約
検証は 2 層構成。
- **ビルド時の型付け・パース**: `src/lib/frontmatter.ts` の zod スキーマ。frontmatter を型付きで読み込むために使う。
- **編集規約のリント**: [`@yukyu30/fluorite`](https://github.com/yukyu30/fluorite) + ルート直下の `fluorite.config.mjs`。`npm run lint:frontmatter`（CI でも実行）で記事の許可タグ・著者・日付形式などをチェックする。

記事 (`content/posts/{slug}/index.mdx`) の frontmatter:

| キー | 必須 | 形式・規約 |
| --- | --- | --- |
| `title` | ✅ | 非空の文字列 |
| `date` | ✅ | `YYYY-MM-DD`（クォート無しの YAML 日付。形式は fluorite の `isoDate()` が検証） |
| `author` | ✅ | `fluorite.config.mjs` の `AUTHORS` のいずれか |
| `tag` | ✅ | `CANONICAL_TAGS` のみで構成された非空配列 |
| `description` | 任意 | 文字列。一覧/OGP の説明文 |
| `thumbnail` | 任意 | `/` 始まりの絶対パス（例 `/posts/{slug}/cover.jpeg`） |
| `coAuthors` | 任意 | `AUTHORS` の配列 |

- 許可タグ (`CANONICAL_TAGS`) と著者 (`AUTHORS`) の正規セットは `fluorite.config.mjs` が単一の管理元。タグや著者を増やすときはここを更新する。
- `me`（プロフィールページ）は通常記事ではないため fluorite の対象から除外している（`exclude`）。
- fluorite はクォート無しの YAML `date` も文字列のまま保持するため、`isoDate()` で `YYYY-MM-DD` 形式を直接検証している（`2026-2-3` や `2026-02-30` のような不正値も弾く）。

### ルーティング（App Router）
- `/` - トップページ（whoami + カテゴリ + 直近一覧 + ページネーション）
- `/page/[page]` - 記事一覧の N ページ目
- `/posts/[slug]` - 記事詳細（Nextra の `importPage` 経由で MDX をレンダリング）
- `/tags` - タグ一覧
- `/tags/[tag]` - タグ別一覧（`work` 系のタグはサムネカードグリッド）
- `/rss.xml` - RSS フィード（`force-static` で Route Handler から静的生成）
- `/posts/[slug]/[file]` - 記事画像配信用 Route Handler（`force-static`）

### スタイリング
- `src/app/globals.css` の単一 CSS で完結（Tailwind は不使用）
- フォントは JetBrains Mono / Inter Tight
- パレット: `#fafaf7` / `#0a0a0a` / `#002ced` / `#ff5a1f`

### MDX 取り込み時の注意
- MDX の strict JSX パーサで読むため、`class` ではなく `className`、`<br>` は `<br/>`、
  inline `style` 文字列は不可。`scripts/convert-posts.ts` がこれらを処理する。

## パスエイリアス

`@/*` → `./src/*`

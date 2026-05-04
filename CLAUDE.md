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
```

## アーキテクチャ

### 記事管理
- 記事と画像は `content/posts/{slug}/` にまとめて格納
  - 本文: `content/posts/{slug}/index.mdx`
  - 画像: 同じディレクトリに置く（例 `content/posts/{slug}/cover.jpeg`）
- MDX 本文の画像参照は相対パス `![](./cover.jpeg)` を使う（Nextra が `next/image` 最適化）
- frontmatter `thumbnail` は URL 形式 `/posts/{slug}/cover.jpeg`
  - `predev` / `prebuild` で `scripts/sync-content-images.ts` が `content/posts/*/` の画像を `public/posts/*/` にミラーするので、この URL がそのまま解決する
  - `public/posts/` は `.gitignore` 済み
- `src/lib/posts.ts` が記事の読み込み・キャッシュ・タグ集計を担当
- frontmatter のスキーマは `src/lib/frontmatter.ts` で zod 定義

### ルーティング（App Router）
- `/` - トップページ（whoami + カテゴリ + 直近一覧 + ページネーション）
- `/page/[page]` - 記事一覧の N ページ目
- `/posts/[slug]` - 記事詳細（Nextra の `importPage` 経由で MDX をレンダリング）
- `/tags` - タグ一覧
- `/tags/[tag]` - タグ別一覧（`work` 系のタグはサムネカードグリッド）
- `/rss.xml` - RSS フィード（Route Handler で動的生成）

### スタイリング
- `src/app/globals.css` の単一 CSS で完結（Tailwind は不使用）
- フォントは JetBrains Mono / Inter Tight
- パレット: `#fafaf7` / `#0a0a0a` / `#002ced` / `#ff5a1f`

### MDX 取り込み時の注意
- MDX の strict JSX パーサで読むため、`class` ではなく `className`、`<br>` は `<br/>`、
  inline `style` 文字列は不可。`scripts/convert-posts.ts` がこれらを処理する。

## パスエイリアス

`@/*` → `./src/*`

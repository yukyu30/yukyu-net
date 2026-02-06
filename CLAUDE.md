# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

yukyu.net を管理するNext.js 16製の個人ブログサイト。Markdownファイルから記事を生成する静的サイト。

## コマンド

```bash
# 開発サーバー起動（Turbopack使用）
npm run dev

# ビルド
npm run build

# テスト実行
npm run test

# 単一テストファイル実行
npm run test -- src/lib/posts.test.ts

# テストウォッチモード
npm run test:watch

# RSS生成
npm run generate:rss

# Lint
npm run lint
```

## アーキテクチャ

### 記事管理
- 記事は `contents/{slug}/index.md` に格納（gray-matterでfrontmatter解析）
- `src/lib/posts.ts` が記事の読み込み・パース・ソートを担当
- Markdownはunified/remark/rehypeパイプラインでHTMLに変換
- カスタムrehypeプラグイン: `rehype-emotion.ts`（感情表現）、`rehype-heading-id.ts`（見出しID付与）

### ルーティング（App Router）
- `/` - トップページ（記事一覧）
- `/page/[page]` - ページネーション
- `/posts/[slug]` - 記事詳細
- `/tags` - タグ一覧
- `/tags/[tag]` - タグ別記事
- `/works` - 作品一覧
- `/status` - ステータスページ

### ビルド・デプロイ
- Vercelでホスト
- ビルド時にRSS生成（`vercel.json`で`npm run build && npm run generate:rss`）
- `outputFileTracingExcludes`でVercel関数サイズを最適化

### スタイリング
- Tailwind CSS 4
- ダークテーマ（黒背景・緑文字のターミナル風UI）
- GSAP (@gsap/react) でアニメーション

## パスエイリアス

`@/*` → `./src/*`

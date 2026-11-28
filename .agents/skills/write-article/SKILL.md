---
name: write-article
description: >-
  yukyu.net のブログ記事を新規作成・編集・添削するときに使う。
  frontmatter 規約（fluorite）、許可タグ、文体・MDX ルール、画像パス、
  検証コマンド（lint:frontmatter / textlint）をまとめたガイド。
---

# ブログ記事の作成・添削スキル

## コンテキスト確認

記事を新規作成するときは、先に以下を確認する:

- 今日の日付: `date +%Y-%m-%d`
- 直近の既存記事: `ls content/posts/ | sort -r | head -10`

## 許可されたタグ・著者

正本は `fluorite.config.mjs`（`CANONICAL_TAGS` / `AUTHORS`）。新しいタグを勝手に作らないこと（増やす場合は `fluorite.config.mjs` を更新して合意を取る）。

**許可タグ (`CANONICAL_TAGS`)**:

- 日記
- つくったもの
- おでかけ
- 振り返り
- 買ったもの
- work
- イベント
- Advent Calendar
- 読書
- 展示会
- 誕生日
- 登壇
- 目標
- お知らせ

**著者 (`AUTHORS`)**:

- `author` は基本 `yukyu`
- AI 共著などがある場合は、必要に応じて `coAuthors` に `fluorite.config.mjs` の `AUTHORS` から指定する

## 記事のフォーマット

保存先: `content/posts/{slug}/index.mdx`

```markdown
---
title: "記事タイトル"
date: YYYY-MM-DD
tag:
  - タグ1
  - タグ2
author: yukyu
---

本文をここに書く
```

- `date` はクォート無しで `YYYY-MM-DD`
- `tag` は許可タグから 1 つ以上
- `author` は `yukyu`
- 任意項目:
  - `description: "..."`（一覧・OGP の説明文）
  - `thumbnail: /posts/{slug}/cover.jpeg`（`/` 始まりの絶対パス）
  - `coAuthors: [...]`（`AUTHORS` の配列）

## 新規作成の手順

1. ユーザーのメッセージから記事のテーマ・内容を把握する
2. ユーザーに以下を確認する:
   - タグの選択（許可リストから選ぶ、複数選択可）
   - 記事タイトルの確認
3. スラッグ（ディレクトリ名）は今日の日付 `YYYY-MM-DD` を使う。同日に既存記事がある、または識別子を付けたい場合は `YYYY-MM-DD-{識別子}` にする
4. `content/posts/{slug}/` ディレクトリを作成し、`index.mdx` を書き込む
5. 書き込み後に以下の検証コマンドを実行して通ることを確認する:
   - `npm run lint:frontmatter`
   - `npm run textlint`

## 記事執筆ルール

- ユーザーの口調・文体に合わせる（このブログはカジュアルな一人称・常体で書かれていることが多い。迷う場合は直近記事のトーンを参照する）
- 見出しは `##` から始める（`#` は使わない）
- 画像は記事と同じディレクトリに置き、MDX 本文では相対パス `![alt text](./filename.jpg)` を使う（Nextra が `next/image` で最適化する）
- 外部リンクは `[テキスト](URL)` 形式
- MDX の strict JSX ルールを守る（`class` ではなく `className`、`<br>` ではなく `<br/>`、inline `style` 文字列は不可）
- 記事は短くても OK。無理に長くしない
- ユーザーが提供した情報や実コード・事実に基づいて忠実に書く。勝手に情報を追加しない

## 記事添削のチェック観点

既存記事や下書き PR を添削するときは、以下を順に確認する:

1. **事実整合性**: コード・仕様・日時・図版と本文に食い違いがないか
2. **文体・語尾の一貫性**: 常体（だ・である）と敬体（です・ます）の意図しない混在、不自然な言い回し、冗長な重複がないか
3. **構成と読みやすさ**: 導入から本論へのつながり、専門用語の初出説明、段落の粒度、見出しの対応関係
4. **規約・MDX 検証**:
   - frontmatter（`title` / `date` / `tag` / `author` / `description` / `thumbnail` / `coAuthors`）
   - 画像パス（本文は `./...`、`thumbnail` は `/posts/{slug}/...`）と `alt` の適切さ
   - `npm run lint:frontmatter` と `npm run textlint` の結果

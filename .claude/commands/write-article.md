---
description: 新しいブログ記事を作成する
allowed-tools: Read, Write, Glob, Grep, Bash(ls:*), Bash(date:*), Bash(mkdir:*)
argument-hint: [記事のテーマや内容]
---

# 記事作成コマンド

## コンテキスト

- 今日の日付: !`date +%Y-%m-%d`
- 現在時刻(UTC): !`date -u "+%Y-%m-%d %H:%M:%S"`
- 既存記事(直近10件): !`ls public/source/ | sort -r | head -10`

## 許可されたタグ一覧

以下のタグのみ使用可能。新しいタグを勝手に作らないこと。

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

## 記事のフォーマット

```markdown
---
title: "記事タイトル"
tags: ["タグ1", "タグ2"]
createdAt: YYYY-MM-DD HH:MM:SS
updatedAt: YYYY-MM-DD HH:MM:SS
---

本文をここに書く
```

## 手順

1. ユーザーの引数またはメッセージから記事のテーマ・内容を把握する
2. AskUserQuestionで以下を確認する:
   - タグの選択（許可リストから選ぶ、複数選択可）
   - 記事タイトルの確認
3. スラッグ(ディレクトリ名)は今日の日付 `YYYY-MM-DD` を使う。同日に既存記事がある場合は `YYYY-MM-DD-{識別子}` にする
4. `public/source/{slug}/` ディレクトリを作成し、`index.md` を書き込む
5. frontmatterの `createdAt` と `updatedAt` は現在のUTC時刻を使う

## 記事執筆ルール

- ユーザーの口調・文体に合わせる（このブログはカジュアルな一人称で書かれている）
- 見出しは `##` から始める（`#` は使わない）
- 画像がある場合は `![alt text](filename.jpg)` 形式
- 外部リンクは `[テキスト](URL)` 形式
- 記事は短くてもOK。無理に長くしない
- ユーザーが提供した情報を元に忠実に書く。勝手に情報を追加しない

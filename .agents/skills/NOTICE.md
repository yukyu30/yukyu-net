# スキルの出典と配置

Antigravity（AGY）・Codex・Claude Code などから共通して読み込めるよう、正本は `.agents/skills/` に置き、`.claude/skills/` からシンボリックリンクで参照しています。

| スキル | 元 | ライセンス |
| --- | --- | --- |
| `write-article` | このリポジトリ固有（yukyu.net の frontmatter / MDX / textlint 規約） | — |
| `write-blog-article`、`article-review`、`tech-review`、`japanese-tech-blog-writing` | [yukyu30/yukyu-skills](https://github.com/yukyu30/yukyu-skills) の `plugins/blog-writing/skills/`（コミット d00b772、2026-11-21 写し） | `write-blog-article`、`article-review`、`tech-review` は [azukiazusa1/skills](https://github.com/azukiazusa1/skills)（MIT License）を参考に調整したもの |
| `stop-ai-slop-jp` | [iKora128/stop-ai-slop-jp](https://github.com/iKora128/stop-ai-slop-jp)（コミット e09d327、2026-11-21 写し） | MIT License（`stop-ai-slop-jp/LICENSE`） |

外部リポジトリ由来のスキルを更新するときは、元のリポジトリから `.agents/skills/` へ写し直してください。

これらのスキルの文体の決まり（「です・ます」、英数字の前後にスペースを入れる、など）は、このブログの textlint の決まり（英数字の前後にスペースを入れない）と違うところがあります。ぶつかるときは、このリポジトリの textlint と `CLAUDE.md`（`AGENTS.md`）を優先します。

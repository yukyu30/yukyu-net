---
id: 681f6068c79f9638d5f1f7c4
title: AI が必要なAPIを契約して欲しい
created_at: 2025-05-10T14:19:20.545Z
updated_at: 2025-05-10T14:19:20.545Z
tags: ["日記"]
---

Devin にはDevin APIがある。
つまり、API経由でDevinを呼び出し、実装をさせることができる。

AI Agentはtool定義すればAPIも呼び出すことができる。

(AI Agentが何らかのプログラムで記述されたツールを持っている前提だが、)この二つを組み合わせたら、自分自身ができないことをDevinに開発させて、自分自身のツールを定義できるAI Agentができそうな気がする。

```
AIエージェント → 使えるツールがない → Devin API → 新機能実装 → 拡張されたAIエージェント
```

そんなことを色々考えていたが、
Devinに開発させる中で、できないことをやろうとすると、外部APIなどの導入することになる。
その時に、決済して、APIキーを取得する必要がある。

いっそのことAIにお財布や、カード、口座を紐づけて、そのなかの金額でAPIを契約して、APIキーの設定をしてほしい。

MastercardがAgent Payを発表したのでそんな未来も近いのかもしれない
https://www.mastercard.com/news/press/2025/april/mastercard-unveils-agent-pay-pioneering-agentic-payments-technology-to-power-commerce-in-the-age-of-ai/

むしろ、その場その場でお金をはらうキャッシュオンなAPIの方が理想的かもしれない。
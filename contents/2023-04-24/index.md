---
id: 677569f0c30fdb8001be08e0
title: AITuber備忘録
created_at: 2023-04-24T00:00:00.000Z
updated_at: 2025-01-01T16:15:06.280Z
tags: ["日記", "つくったもの"]
---


備忘録

## RVC 向けボイスモデル

自分の声を学習させて[RVC 向け学習済みモデル yukyu](https://suzuri.jp/yukyu30/digital_products/11111)を作成した。
このボイスモデルを使うことで、誰かの声を自分の声に変換できる。

<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;"><iframe title="RVC向け学習済みモデルyukyuのサンプルボイス" src="https://www.youtube.com/embed/UMar_9ulssY?rel=0" style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;" allowfullscreen scrolling="no" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"></iframe></div>

ボイスモデルをつくったところで自分の声を自分に変換させても面白くないので、音声合成ソフトで出力した音声を自分の声に変換していた。AITuber と組み合わせればもっと面白くなりそうと思って作り始めた。

動作したものはこれ

<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.25%;"><iframe title="AITuber実験配信のピックアップ ep.0" src="https://www.youtube.com/embed/x2DxEJd9-28?rel=0" style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;" allowfullscreen scrolling="no" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share;"></iframe></div>

## 実装

Python で開発を始めた。langchain を使うために Python にした。Live2d モデルも動かすためデスクトップの Window PC で開発をした。
簡単な AITuber は基本の動作は以下の繰り返しになる。

- コメントを取得する
- コメントから返信を考える(ChatGPT)
- 返信を音声として出力する(VOICE VOX)

今回は音声変換を行うので、最後に音声を VC Client というボイスチェンジャーソフトで自分の声へ変換するという処理を付け加えた。

<blockquote class="twitter-tweet" data-dnt="true" align="center" data-conversation="none"><p lang="ja" dir="ltr">いろいろ複雑になりそうなので一旦まとめた <a href="https://t.co/Z8d6e89pXr">pic.twitter.com/Z8d6e89pXr</a></p>&mdash; yukyu (a.k.a ugo) (@yukyu30) <a href="https://twitter.com/yukyu30/status/1649798197261524997?ref_src=twsrc%5Etfw">April 22, 2023</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>



## コメントを取得する

Youtub のコメント 10 秒間に一回取得することにした。
前回取得してないコメントから最新のコメントが一気に取得できるので、一件一件に返信を行っていたら、時間がかかるので、ChatGPT を使って複数のコメントから一件コメントを抽出するようにした。
より内容があるコメントが抽出されるので結構使えそうだった。

## コメントから返信を考える

これはコメントと AITuber の設定を渡して、返信を ChatGPT に生成してもらった。

## 返信を音声として出力する

VOICE VOX を起動して、API を叩くと音声合成できる。

ここまでは Python で実装した。

## 声を変換する処理はゴリ押し

合成音声を受け取って、音声変換する機能をコードで実装するのが大変そうだったので、仮想オーディオデバイスで無理やり実現した。

仮想オーディオデバイスで合成音声（PC 音）をマイク入力として扱い、VC Client に入力するようにした。出力先も仮想オーディオデバイスにして、OBS で変換後の音声だけを取り込むようにした。
VC Client だけは Mac で動かして、Windows からネットワーク越しで利用した。

## 課題

返信を考えて、音声合成したのちに、音声変換をしてるのでコメントしてから返答するまで時間がかかる。
高速化しないと無言の時間が多くなってしまうのでどうにかしたい。

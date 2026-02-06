---
id: 67754de9c30fdb8001b1979a
title: End-User Developmentと生成AI
created_at: 2024-07-01T00:00:00.000Z
updated_at: 2025-01-01T14:16:24.285Z
tags: ["日記"]
---

結論も、オチもない話です。

## ClaudeのArtifacts機能
ClaudeにArtifacts機能が追加された。
対話をしながらWebサイトやスライド、チャートの作成を行うことができるようになった。コードを書くだけではなく、そのコードが実行できる環境まで提供されるので、
ClaudeにWebサイトをつくらせて、それを隣のウィンドウでリアルタイムに触ることができる。


<iframe
  frameBorder='0'
  src='https://www.youtube.com/embed/rHqk0ZGb6qo?si=FtwFJQ2rS9hH2PyJ'
  allowFullScreen={true}
  style={{
    width: '100%',
    height: 'auto',
    aspectRatio: '16 / 9',
  }}
  data-ratio='1.755485893416928'
></iframe>
Artifacts機能を試してみて、生成したものをその場で触って試すことができとても体験として良くて感動した。

いっそのこと、Webサービスはシステムを提供して、フロントエンドはユーザーがAIに作らせ、思うがままにカスタマイズできるようなことができないだろうかと考えた。
<blockquote class="twitter-tweet" data-dnt="true" align="center"><p lang="ja" dir="ltr">いろんなサービスがAPIだけ準備して、フロントエンドはLLMにユーザーに好きな様に作らせる未来こい</p>&mdash; yukyu (a.k.a ugo) (@yukyu30) <a href="https://twitter.com/yukyu30/status/1804856990268874948?ref_src=twsrc%5Etfw">June 23, 2024</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>


そして、このような考え方は近い概念としてEnd-User Developmentというものを知った。

## End-User Develoment

> エンドユーザー・デベロプメント（英: End-user development, EUD）とは、エンドユーザーがEUCよりもさらに積極的にシステムの開発に関わるという考え方。 <br/>[wikipedia](https://ja.wikipedia.org/wiki/%E3%82%A8%E3%83%B3%E3%83%89%E3%83%A6%E3%83%BC%E3%82%B6%E3%83%BC%E3%83%BB%E3%83%87%E3%83%99%E3%83%AD%E3%83%97%E3%83%A1%E3%83%B3%E3%83%88) より引用

この考えを巡らせている時に、[多摩美エンターテイメント論「映像、ツール、不思議の輪」2/2](https://www.youtube.com/watch?v=k8UFLqxn02M&t=4583s)を観た。

この中で、[プログラマブルペンツール](https://s.baku89.com/pentool/)というWebアプリが紹介されていた。

<iframe
  frameBorder='0'
  src='https://www.youtube.com/embed/k8UFLqxn02M?si=zWncH2koUKWtz13F&amp;start=292'
  allowFullScreen={true}
  style={{
    width: '100%',
    height: 'auto',
    aspectRatio: '16 / 9',
  }}
  data-ratio='1.755485893416928'
></iframe>


これは、プログラムを書くことで、新しいペンツールを追加できることが特徴のペイントアプリである。
つまり、ユーザーが欲しいペンをプログラムを書くことで、欲しいペンを機能として組み込むことができる。

このWebアプリにAIによるツール生成が組み合わさったら面白いことになるんじゃなかろうか。

ちなみにソースコードは公開されているので、組み合わせることはできそうだ。後日やってみようと思う。

https://github.com/baku89/pentool

## 橋本 麦
このプログラマブルペンツールを作った、橋本麦さんは Google ストリートビューを利用したMV作成(group_inouのEYE)を行うなどしていて、面白いのでぜひいろんな作品を見て欲しい。

<iframe
  frameBorder='0'
  src='https://www.youtube.com/embed/WSFeje8-4Vc?si=GQLIGTjLQvBM9vdZ'
  allowFullScreen={true}
  style={{
    width: '100%',
    height: 'auto',
    aspectRatio: '16 / 9',
  }}
  data-ratio='1.755485893416928'
></iframe>

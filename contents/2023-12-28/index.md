---
id: 67755fcec30fdb8001b7b2b2
title: 2023年に作ったプロダクト7つをまとめて振り返る
created_at: 2023-12-28T00:00:00.000Z
updated_at: 2025-01-01T15:32:27.106Z
tags: ["日記", "振り返り", "Advent Calendar", "つくったもの"]
---


この記事は [🎅GMO ペパボエンジニア Advent Calendar 2023](https://adventar.org/calendars/8634) の 24 日目の記事です。コロナになり執筆が遅れてしまいました...！！

<div className='mt-8 w-full'>
  <iframe
    src='https://adventar.org/calendars/8634/embed'
    width='100%'
    height='500px'
    frameborder='0'
    loading='lazy'
  ></iframe>
</div>

2023 年に作った個人プロダクトを紹介します。
[活動履歴ページ](/activity)にこれまでの活動をまとめています。

## 今年つくったもの

### hakuran

- Zenn: [ブログ内の文章を T シャツにする機能を作った](https://zenn.dev/yu_9/articles/5c30a7401ca62c)
- GitHub: [yukyu30/hakuran-blog](https://github.com/yukyu30/hakuran-blog)

ブログ内の文章を T シャツにできる機能があるブログを作りました。
Gatsby と SUZURI API を利用して作成しました。
このころは ChatGPT で[サンプル記事](https://sensational-puffpuff-0189ed.netlify.app/proverb-that-does-not-exist/)の生成をしているくらいで、開発にはそこまで活用していませんでした。

hakurun は、各々の素敵だと思う言葉が並ぶ様子が博覧会に似ていると感じたことから名付けました。
ちなみに現在は稼働をし停止させてあります。

### Rust 製 ChatGPT Bot

- Zenn: [Rust で ChatGPT を利用した Discord Bot 作った](https://zenn.dev/yu_9/articles/737aca68c7fcd8)
- GitHub: [yukyu30/chatgpt-bot-for-discord](https://github.com/yukyu30/chatgpt-bot-for-discord)

Rust で ChatGPT を利用した Discord Bot を作りました。
Rust をつかった理由としては discord.py というライブラリが停止になり、他に使えるライブラリを探していたところ serenity を見つけました。Rust にも興味があったので Rust で作ることにました。
現在は discord.py のメンテナンスが再開されているようです。

shuttle と呼ばれるプラットフォームにデプロイしていました。
途中にアップデートで 30 分アクセスがないとスリープしてしまうようになったが、リリースノートをもとに常駐稼働をできるオプションを有効化する、環境変数の取り扱い方がいつもと異なるなど shuttle に振り回されていました。

### AITuber

- Blog: [AITuber 備忘録](https://archive.yukyu.net/posts/diary/2023/04/24/index)
  <div className='my-8 w-full'>
    <iframe
      width='100%'
      src='https://www.youtube.com/embed/x2DxEJd9-28?si=-uLJb-8OrMyXI0Vx'
      title='YouTube video player'
      frameborder='0'
      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
      allowfullscreen
    ></iframe>
  </div>
  VC Clientと呼ばれるリアルタイムボイスチェンジャーが出てきた時に、これで自分の声をもったAITuberを誕生させられそうと思って、生み出しました。

全部のコメントに対して返信するのではなく、いくつかのコメントからピックアップして返信するような仕組みになっています。
YouTube Live のコメントを取得、ChatGPT で返信を生成、VoiceVox で音声を生成、VC Client で音声変換という仕組みで動いています。

### チャットで SUZURI でグッズ作成

<div className='my-8 w-full'>
  <iframe
    width='100%'
    src='https://www.youtube.com/embed/mIQXjPEEStA?si=BG-3MR1r88l_GJpf'
    title='YouTube video player'
    frameborder='0'
    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    allowfullscreen
  ></iframe>
</div>
ChatGPTのFunction Calling、SUZURI APIを使って対話的にSUZURIでグッズ作成できるようにしました。 上に移動してという指示に対してfunction
callingで座標を構造的に出力させ、そのパラメータを使いSUZURI APIへリクエストを送るということを行っています。
体験的にはそこまで良くはないですが、対話的にグッズを作れるのは面白かったです。

### QuizBite(GPT-4 によるクイズ生成プラットフォーム)

- Zenn: [GPT-4 と LangChain で技術記事のクイズを生成するサイトを作った](https://zenn.dev/yu_9/articles/cd31b6a904dcde)
- SpeakerDeck: [あらゆるサイトを クイズにするサイトをつくった](https://speakerdeck.com/yukyu30/arayurusaitowo-kuizunisurusaitowotukututa)
- サイト: https://quizbite.yukyu.net/about

<div className='my-8 w-full'>
  <iframe
    width='100%'
    src='https://www.youtube.com/embed/ZoWNuBn9iqA?si=x7PWrA00sR-hHQaZ'
    title='YouTube video player'
    frameborder='0'
    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
    allowfullscreen
  ></iframe>
</div>
GPT-4とLangChainでクイズ生成プラットフォームを作りました。 URLを入力することでそのサイトの記事をクイズにすることができます。
長い記事ではエラーになったり、そもそも稼働が安定してないなどの問題を抱えているので、今後改善していきたいです。
モバイルアプリもつくっていたのですが、申請が思いのほかめんどくさくて、開発者登録で終わっています。

### shift uni converter

<div><div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 52.5%; padding-top: 120px;"><iframe title="【MacOS用】shift uni converter by 悠久 ( yukyu30 ) ∞ SUZURI" data-iframely-url="//cdn.iframe.ly/api/iframe?app=1&url=https%3A%2F%2Fsuzuri.jp%2Fyukyu30%2Fdigital_products%2F24192&key=878c5bef402f0b2911bf6d4ce6261abd" style="top: 0; left: 0; width: 100%; height: 100%; position: absolute; border: 0;" allowfullscreen></iframe></div></div><script async src="//cdn.iframe.ly/embed.js" charset="utf-8"></script>

- note: [「shift uni converter」を作りました : Synthesizer V への UST ファイルのインポートサポートツール](https://note.com/yukyu30/n/n200d04187fda)

  <div className='my-8 w-full'>
    <iframe
      width='100%'
      src='https://www.youtube.com/embed/lX7x1O_gN5c?si=NvU8Dp6GAgmW3pdN'
      title='YouTube video player'
      frameborder='0'
      allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
      allowfullscreen
    ></iframe>
  </div>
  ニッチなツールですが、USTファイルをshift-jisからutf-8に変換するツールを作りました。

UTAU という歌声合成ソフトで作成された UST ファイルは shift-jis でエンコードされているのですが、Synthesizer V という歌声合成ソフトでは utf-8 でエンコードされている必要があります。
その間を取り持つためのツールです。

Tauri を使って開発のですが、なかなか体験が良かったです。
PC のネイティブの機能を使うところは Rust でかいて、GUI などのフロントエンドは Next.js で書きました。
ソフト自体は 3 日間でできました。

### 「SUZURI Tools」

- サイト: https://suzuri-tools.vercel.app/

絶賛作成中なのですが、SUZURI API を活用したツールを作ることがあるのでそれらをまとめるサイトをつくりました。

現在は[SUZURI Ads](https://suzuri-tools.vercel.app/ads)という配信などに表示する SUZURI の広告を作成するツールを公開しています。
正式リリースはまだしていないので、URL の変更や破壊的変更が行われる可能性があります。
<blockquote class="twitter-tweet" data-dnt="true" align="center"><p lang="ja" dir="ltr">配信画面にSUZURIのグッズをシュッと表示できるウィジェットを考えたが予想以上に場所をとるので、あまりよくなさそうだった<br>SUZURI APIで自分のショップのグッズ情報取得して、スライドショー的に表示するウェブページを作って、読み込ませてる <a href="https://t.co/Uuj72daR0G">pic.twitter.com/Uuj72daR0G</a></p>&mdash; yukyu (a.k.a ugo) (@yukyu30) <a href="https://twitter.com/yukyu30/status/1734264275894706513?ref_src=twsrc%5Etfw">December 11, 2023</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>



Next.js、 SUZURI API を利用しています。
続報は正式公開までお待ちください！

## まとめ

完成度はまちまちですが 6 つのプロダクトと 1 人を生み出しました。2 ヶ月に 1 つくらいのペースで作っていたことになりますね。技術検証的な意味合いを含むものが多かったです。
言語としては、Rust を書く機会が増えました。モバイル、Web、デスクトップなど異なるプラットフォームのアプリを作れたのも良かったです。

特に社内コンテストで入賞までは行かないものの、取り上げられたものもいくつかあるので、嬉しかったです。

今は便利な RSS リーダーを作りたいというアイデアがあります！来年はそれを作りたいです！

---
id: 67755d98c30fdb8001b6c554
title: BuriKaigi2024に参加した
created_at: 2024-01-24T00:00:00.000Z
updated_at: 2025-01-01T15:22:26.933Z
tags: ["日記", "イベント"]
---


2024/01/20 に開催された [BuriKaigi2024](https://burikaigi.dev/) に参加しました。

その中で印象に残ったセッションを書いて行きます。

## 何も知らない課金システムを移行した話

<iframe
  class='speakerdeck-iframe'
  frameborder='0'
  src='https://speakerdeck.com/player/45038a5aab274d98a894e53309bb8561'
  title='何も知らない課金システムを移行した話'
  allowfullscreen='true'
  style={{
    border: '0px',
    background: 'padding-box padding-box rgba(0, 0, 0, 0.1)',
    margin: '0px',
    padding: '12px',
    borderRadius: '6px',
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 5px 40px',
    width: '100%',
    height: 'auto',
    aspectRatio: '560 / 315',
  }}
  data-ratio='1.7777777777777777'
></iframe>

決済基盤を移行する際の苦労やそれをどのように解決していったのかが話されていました。
想定していないデータの重複、不足などによるデータ migration での苦労が印象に残りました。
問題が発生したら切り戻しを行うこできるように並行運用をしておく、フラグでの段階的リリースなど決済基盤をとめないための工夫も参考になりました。

## OG 画像の動的生成を突き詰める

<iframe
  class='speakerdeck-iframe'
  frameborder='0'
  src='https://speakerdeck.com/player/b075ddecde234f50b1feee22887ae455'
  title='もう一歩進めたい OG画像の動的生成'
  allowfullscreen='true'
  style={{
    border: '0px',
    background: 'padding-box padding-box rgba(0, 0, 0, 0.1)',
    margin: '12px',
    padding: '0px',
    borderRadius: '6px',
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 5px 40px',
    width: '100%',
    height: 'auto',
    aspectRatio: '560 / 315',
  }}
  data-ratio='1.7777777777777777'
></iframe>

> Web 技術で作れることと、Web のように作ることを混同しない方がよい

という言葉が心に残りました。
OG は Web サイトと異なり、サイズの決まっている画像なので、視覚錯覚や細かなマージンの調整をして画像としてデザインをやるべきという趣旨の内容でした。
確かにいまの SUZURI の OG は Web としてデザインされているので、画像としてデザインしていきたいなと思いました。

せっかくプログラミングを使うのであれば、動的な画像生成を行おうという話もありました。

- 画像から平均色を取ってグラデーションに利用する
- いくつかの背景画像を準備して、ランダムに利用する

などの手法が紹介されていました。そのなかでも特に面白かったのは svg を利用し、背景パターンを生成するという手法です。
vercel/og が中間状態として svg を利用しています。そこで svg を出し分ける jsx を使って、背景パターンを自動生成する手法でした。
とても作るのが面白そうだったので、このブログでも og の背景パターン自動生成をおこなってみようと思います。

自分が働いている SUZURI では
背景色の動的決定がすでに実装されているので、よく考えてたら、よくできているなと思いました。
![](/images/posts/2024-01-20/og.png)

## 2023 年のフロントエンド振り返りと 2024 年

<iframe
  className='speakerdeck-iframe'
  frameBorder='0'
  src='https://speakerdeck.com/player/3763ef6bf4dd4d0fa49e97c07e31d3b3'
  title='2023年のフロントエンド振り返りと2024年'
  allowFullScreen={true}
  style={{
    border: '0px',
    background: 'padding-box padding-box rgba(0, 0, 0, 0.1)',
    margin: '0px',
    padding: '12px',
    borderRadius: '6px',
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 5px 40px',
    width: '100%',
    height: 'auto',
    aspectRatio: '560 / 319',
  }}
  data-ratio='1.755485893416928'
></iframe>

2023 年のフロントエンド振り返りとして、2024 年はどうなっていくという予想が話されていました。追加された CSS と全ブラウザでサポートされた CSS
から HeadlessUI や shadcn/ui などの話がありました。

フロントエンドの技術的な流れが早いので、一年の主要なトピックをキャッチアップすることできました。
ブラウザ間での html,css,WebAPI などの互換性が尺度を示す Baseline が登場したことを知りました。
MDN などですでに表示されているみたいなので今後業務で使う技術がある場合は Baseline を確認してみようと思いました。

## 1,000 年後の未来人に届く Web サイトを作りたい！

<iframe
  class='speakerdeck-iframe'
  frameborder='0'
  src='https://speakerdeck.com/player/dcb0e1675aba4ae194715c7a78e9205f'
  title='1,000年後の未来人に届くWebサイトを作りたい！'
  allowfullscreen='true'
  style={{
    border: '0px',
    background: 'padding-box padding-box rgba(0, 0, 0, 0.1)',
    margin: '0px',
    padding: '12px',
    borderRadius: '6px',
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 5px 40px',
    width: '100%',
    height: 'auto',
    aspectRatio: '560 / 315',
  }}
  data-ratio='1.7777777777777777'
></iframe>

1,000 年後も残る Web サイトを作るにはというテーマで
記憶メディアの耐久性、Web3、国会図書館、Web Archive などさまざまな Web サイトを残す方法が提案されていました。
とくに Web Archive を支える WARC 形式というフォーマットやクローラー、Wayback と呼ばれる WARC ファイルの
ビューワーなど関連する技術が紹介されていました。

Web Archive はサイトを保存しているだけというくらいの認識でしたが、関連する技術について学ぶことができました。
自分はこのサイトを本にして自費出版して、国会図書館に納本したいです。

## Studio の裏側

生成 AI をデザインフローに組み込むためにはどうすべきかというテーマの話がありました。
自分が印象に残った内容は以下の通りです。

- 生成 AI を使えるように組み込むだけでは、一過性の驚きで終わってしまう
  - 実際にデザインフローでのインサイトを発見し、その支援をするようなものを作るのが大事
- 生成 AI ではユーザーが主導権を持っておくことが大事
  - copilot のようなあくまでもユーザーが主体で寄り添っていくようなものが良い

## 新卒研修で取り組んだスクラム開発で苦戦したところと学んだこと

<iframe
  className='speakerdeck-iframe'
  frameBorder='0'
  src='https://speakerdeck.com/player/29aa4b8e818e4bbeb92f7f8320ea96c9'
  title='新卒研修で取り組んだスクラム開発で苦戦したところと学んだこと'
  allowFullScreen={true}
  style={{
    border: '0px',
    background: 'padding-box padding-box rgba(0, 0, 0, 0.1)',
    margin: '0px',
    padding: '12px',
    borderRadius: '6px',
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 5px 40px',
    width: '100%',
    height: 'auto',
    aspectRatio: '560 / 315',
  }}
  data-ratio='1.7777777777777777'
></iframe>

自分のチームでもスクラムを取り入れていこうとしているので、どんなところに苦戦して、どのように解決していったのかが実例をもとに
話されていて今後スクラム開発をしていく上で気をつけていくべきところがわかりました。
参考になりました。

## エンジニアとして「事業」作りに関わるということ

<iframe
  className='speakerdeck-iframe'
  frameBorder='0'
  src='https://speakerdeck.com/player/458467ec60f6415aa8568c9905e046c3'
  title='エンジニアとして「事業」作りに関わるということ'
  allowFullScreen={true}
  style={{
    border: '0px',
    background: 'padding-box padding-box rgba(0, 0, 0, 0.1)',
    margin: '0px',
    padding: '12px',
    borderRadius: '6px',
    boxShadow: 'rgba(0, 0, 0, 0.2) 0px 5px 40px',
    width: '100%',
    height: 'auto',
    aspectRatio: '560 / 315',
  }}
  data-ratio='1.7777777777777777'
></iframe>

少人数のチームで動いています。そのため、チームでできることは限られています。その中で
どのようにプロダクトの価値を検証して、改善していくかが話されていました。
品質のグラデーションという自分が初めて触れる概念で、自分が苦手な部分だなと思いました。
あれもこれもやったら親切にかなと思ってしまうので、やらないことやることを明確にして、これはしないなどの判断をして
リリースと仮説検証のサイクルを回していくことが大事だなと思いました。

## おわりに

初めて BuriKaigi に参加しました。
RubyKaigi と異なり幅の広い技術が話されているので、自分が普段キャッツアップできていない領域の話が聞けて楽しかったです。
来年も参加したいです！
